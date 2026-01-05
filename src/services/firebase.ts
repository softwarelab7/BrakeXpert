import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit, writeBatch, doc, onSnapshot, type DocumentChange } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { Product } from '../types';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId
);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collections
export const productsCollection = collection(db, 'pastillas');

// Helper to normalize product data coming FROM Firebase
export const normalizeProduct = (docId: string, data: any): Product => {
    const p = { id: docId, ...data };

    // 1. Normalize Posicion
    p.posicion = (p.posicion || p.posición || 'AMBAS').toUpperCase();

    // 2. Normalize Medidas (Array string -> Object or String -> Object)
    let rawMedidas = p.medidas;
    let ancho: number | string = '';
    let alto: number | string = '';

    // Handle array case
    if (Array.isArray(rawMedidas) && rawMedidas.length > 0) {
        rawMedidas = rawMedidas[0];
    }

    if (typeof rawMedidas === 'string') {
        const parts = rawMedidas.toLowerCase().split('x');
        if (parts.length === 2) {
            const a = parseFloat(parts[0].trim());
            const h = parseFloat(parts[1].trim());
            ancho = a || '';
            alto = h || '';
        }
    } else if (rawMedidas && typeof rawMedidas === 'object') {
        const a = parseFloat(rawMedidas.ancho) || parseFloat(rawMedidas.width);
        const h = parseFloat(rawMedidas.alto) || parseFloat(rawMedidas.height) || parseFloat(rawMedidas.largo);
        ancho = a || '';
        alto = h || '';
    }

    p.medidas = { ancho, alto };

    // 3. Normalize Arrays
    const ensureArray = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);
    p.fmsi = ensureArray(p.fmsi);
    p.oem = ensureArray(p.oem);
    p.ref = ensureArray(p.ref);
    p.imagenes = ensureArray(p.imagenes);
    p.aplicaciones = ensureArray(p.aplicaciones).map((app: any) => ({
        marca: app?.marca || '',
        modelo: app?.modelo || app?.serie || '',
        serie: app?.serie || '',
        año: app?.año || '',
        posicion: (app?.posicion || 'DELANTERA').toUpperCase()
    }));

    // 4. Fallback for reference
    p.referencia = p.referencia || (p.ref && p.ref[0]) || 'SIN-REF';

    return p as Product;
};

// Real-time subscription
export const subscribeToProducts = (callback: (products: Product[], changes: DocumentChange[]) => void) => {
    return onSnapshot(productsCollection, (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            products.push(normalizeProduct(doc.id, doc.data()));
        });
        callback(products, snapshot.docChanges());
    }, (error) => {
        console.error("Error subscribing to products:", error);
    });
};

// Seed Database with Mock Data
export const seedDatabase = async () => {
    const products = getMockProducts();
    const batchSize = 500; // Firebase batch limit
    const chunks = [];

    for (let i = 0; i < products.length; i += batchSize) {
        chunks.push(products.slice(i, i + batchSize));
    }

    let totalUploaded = 0;

    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((product) => {
            const docRef = doc(productsCollection, product.id || undefined); // Use ID if present, otherwise auto-id
            // Remove helper properties if any, keep raw data
            const productData = { ...product };
            batch.set(docRef, productData);
        });
        await batch.commit();
        totalUploaded += chunk.length;
        console.log(`Uploaded batch of ${chunk.length} products. Total: ${totalUploaded}`);
    }

    return totalUploaded;
};

// Fetch all products
export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const querySnapshot = await getDocs(productsCollection);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push(normalizeProduct(doc.id, doc.data()));
        });

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Fetch products by position
export const fetchProductsByPosition = async (position: string): Promise<Product[]> => {
    try {
        const q = query(
            productsCollection,
            where('posicion', 'in', [position.toUpperCase(), 'AMBAS'])
        );

        const querySnapshot = await getDocs(q);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push(normalizeProduct(doc.id, doc.data()));
        });

        return products;
    } catch (error) {
        console.error('Error fetching products by position:', error);
        throw error;
    }
};

// Search products by reference
export const searchByReference = async (reference: string): Promise<Product[]> => {
    try {
        const q = query(
            productsCollection,
            where('referencia', '>=', reference),
            where('referencia', '<=', reference + '\uf8ff'),
            limit(50)
        );

        const querySnapshot = await getDocs(q);
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push(normalizeProduct(doc.id, doc.data()));
        });

        return products;
    } catch (error) {
        console.error('Error searching by reference:', error);
        throw error;
    }
};

// Update a product
export const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
        const productRef = doc(db, 'pastillas', id);
        const { id: _, ...data } = { ...productData } as any;

        // CRITICAL: Convert measures back to legacy format for Firebase
        if (data.medidas && typeof data.medidas === 'object' && !Array.isArray(data.medidas)) {
            data.medidas = [`${data.medidas.ancho || 0} x ${data.medidas.alto || 0}`];
        }

        await writeBatch(db).set(productRef, data, { merge: true }).commit();
        return true;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Add a new product
export const addProduct = async (productData: Partial<Product>) => {
    try {
        const productRef = doc(productsCollection);
        const { id: _, ...data } = { ...productData } as any;

        // CRITICAL: Convert measures back to legacy format for Firebase
        if (data.medidas && typeof data.medidas === 'object' && !Array.isArray(data.medidas)) {
            data.medidas = [`${data.medidas.ancho || 0} x ${data.medidas.alto || 0}`];
        }

        await writeBatch(db).set(productRef, data).commit();
        return productRef.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};


// History / Audit Log
export interface HistoryLog {
    id?: string;
    productId: string;
    productRef?: string; // e.g. "D123"
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    changes?: { field: string; old: any; new: any }[];
    user: string; // email
    timestamp: number;
}

export const historyCollection = collection(db, 'history');

export const addHistoryLog = async (log: Omit<HistoryLog, 'id' | 'timestamp'>) => {
    try {
        await writeBatch(db).set(doc(historyCollection), {
            ...log,
            timestamp: Date.now()
        }).commit();
    } catch (error) {
        console.error("Error adding history log:", error);
        // Don't throw, history logging failure shouldn't block main action
    }
};

export const fetchHistoryLogs = async (limitCount = 50): Promise<HistoryLog[]> => {
    try {
        const q = query(historyCollection, limit(limitCount));

        const querySnapshot = await getDocs(q);
        const logs: HistoryLog[] = [];
        querySnapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() } as HistoryLog);
        });
        return logs.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

// Report Error Functionality
export const reportsCollection = collection(db, 'reports');

export const addReport = async (reportData: {
    productId: string;
    productReference: string;
    description: string;
    userEmail?: string; // Optional
}) => {
    try {
        await writeBatch(db).set(doc(reportsCollection), {
            ...reportData,
            status: 'PENDING',
            timestamp: Date.now()
        }).commit();
    } catch (error) {
        console.error("Error adding report:", error);
        throw error;
    }
};

// Mock data for development (remove when Firebase is configured)
export const getMockProducts = (): Product[] => {
    return Array.from({ length: 723 }, (_, i) => ({
        id: `product-${i + 1}`,
        referencia: `D${100 + i}`,
        ref: [`${String(i + 1).padStart(6, '0')}INC`, `D${100 + i}`],
        oem: [`OEM-${i + 1}`, `OEM-${i + 2}`],
        fmsi: [`FMSI-${i + 1}`],
        fabricante: ['Autopar', 'Frasle', 'Jurid', 'Brembo', 'Bosch'][i % 5],
        posicion: ['DELANTERA', 'TRASERA', 'AMBAS'][i % 3] as 'DELANTERA' | 'TRASERA' | 'AMBAS',
        imagenes: [
            'https://via.placeholder.com/200x150?text=Brake+Pad',
            'https://via.placeholder.com/200x150?text=Detail+View'
        ],
        aplicaciones: [
            {
                marca: ['Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Toyota', 'Honda', 'Mazda', 'Volkswagen', 'Renault'][i % 10],
                modelo: ['Aveo', 'Spark', 'Cruze', 'Malibu', 'Silverado', 'Corolla', 'Civic', '3', 'Jetta', 'Logan'][i % 10],
                año: `${2010 + (i % 15)}`,
                posicion: ['DELANTERA', 'TRASERA', 'AMBAS'][i % 3] as 'DELANTERA' | 'TRASERA' | 'AMBAS'
            },
            {
                marca: ['Fiat', 'Peugeot', 'Citroën', 'Mg', 'Ram', 'Acura', 'Jetour'][i % 7],
                modelo: ['Uno', '208', 'C3', 'ZS', '1500', 'TLX', 'X70'][i % 7],
                año: `${2012 + (i % 12)}`,
                posicion: ['DELANTERA', 'TRASERA', 'AMBAS'][(i + 1) % 3] as 'DELANTERA' | 'TRASERA' | 'AMBAS'
            }
        ],
        medidas: {
            ancho: 100 + (i % 50),
            alto: 40 + (i % 30)
        }
    }));
};

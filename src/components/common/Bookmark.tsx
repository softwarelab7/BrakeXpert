import styled from 'styled-components';

interface BookmarkProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
  strokeWidth?: number;
}

const Bookmark = ({ checked, onChange, size = 24, strokeWidth = 2 }: BookmarkProps) => {
  return (
    <StyledWrapper
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      style={{ fontSize: size ? size / 2 : undefined }}
    >
      <div className="bookmark-checkbox">
        <input
          type="checkbox"
          className="bookmark-checkbox__input"
          checked={checked}
          readOnly
        />
        <label className="bookmark-checkbox__label">
          <svg
            className="bookmark-checkbox__icon"
            viewBox="0 0 24 24"
            style={{ strokeWidth: strokeWidth }}
          >
            <path className="bookmark-checkbox__icon-back" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            <path className="bookmark-checkbox__icon-check" d="M8 11l3 3 5-5" />
          </svg>
        </label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .bookmark-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bookmark-checkbox__input {
    display: none;
  }

  .bookmark-checkbox__label {
    cursor: pointer;
    display: flex;
  }

  .bookmark-checkbox__icon {
    width: 2em;
    height: 2em;
    fill: none;
    /* stroke-width handled inline */
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke 0.3s, fill 0.3s;
  }

  .bookmark-checkbox__icon-back {
    stroke: var(--text-primary); /* Adapted for Theme Support */
    transition: transform 0.3s;
  }

  .bookmark-checkbox__icon-check {
    stroke: #fff;
    stroke-dasharray: 16;
    stroke-dashoffset: 16;
    transition: stroke-dashoffset 0.3s, transform 0.3s;
    transform: translateX(2px);
  }

  /* Checked State */
  .bookmark-checkbox__input:checked
    + .bookmark-checkbox__label
    .bookmark-checkbox__icon {
    fill: #ff5a5f;
  }

  .bookmark-checkbox__input:checked
    + .bookmark-checkbox__label
    .bookmark-checkbox__icon-back {
    stroke: #ff5a5f;
    transform: scale(1.1);
    animation: bookmark-pop 0.4s ease;
  }

  .bookmark-checkbox__input:checked
    + .bookmark-checkbox__label
    .bookmark-checkbox__icon-check {
    stroke-dashoffset: 0;
    transition-delay: 0.2s;
  }

  @keyframes bookmark-pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1.1);
    }
  }`;

export default Bookmark;

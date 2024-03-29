import { useContext } from 'react';
import { LoginContext } from '../../../context/LoginContext';

const GoBackButton = () => {
  const loginContext = useContext(LoginContext);

  if (!loginContext) {
    return;
  }

  const { setCreateAccountFormStateOnClick } = loginContext;

  return (
    <button
      onClick={() => {
        setCreateAccountFormStateOnClick(false);
      }}
      className="button-primary absolute left-12 top-8"
    >
      Go Back
    </button>
  );
};

export default GoBackButton;

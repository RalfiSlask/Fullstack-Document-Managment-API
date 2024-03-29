import ResetButton from '../../shared/ResetButton';
import SubmitButton from '../../shared/SubmitButton';
import { useContext } from 'react';
import { LoginContext } from '../../../context/LoginContext';
import CreateAccountInput from './CreateAccountInput';
import { ICreateAccountFormInputValues } from '../../../utils/types/types';
import PasswordStrength from './PasswordStrength';

const CreateAccountForm = () => {
  const loginContext = useContext(LoginContext);

  if (!loginContext) {
    return;
  }

  const { handleCreateAccountSubmit, createAccountErrorMessage, formSubmitted, setIsFormValid, setFormSubmitted } =
    loginContext;

  const inputs = [
    { id: 1, type: 'text', text: 'name', inputKey: 'name' as keyof ICreateAccountFormInputValues },
    { id: 2, type: 'text', text: 'email', inputKey: 'email' as keyof ICreateAccountFormInputValues },
    { id: 3, type: 'password', text: 'password', inputKey: 'password' as keyof ICreateAccountFormInputValues },
  ];

  return (
    <form
      onSubmit={e => {
        handleCreateAccountSubmit(e);
      }}
      id="formInput"
      className="flex flex-col gap-12 w-[500px] items-center"
    >
      <p className="text-red-500 text-lg h-[30px]">{createAccountErrorMessage}</p>
      <div className="flex w-[500px] flex-col items-start gap-10">
        <div className="w-[350px] flex flex-col gap-4 items-start">
          {inputs.map(input => {
            const { id, type, text, inputKey } = input;
            return (
              <CreateAccountInput
                key={id}
                type={type}
                text={text}
                inputKey={inputKey}
                formSubmitted={formSubmitted}
                setIsFormValid={setIsFormValid}
                setFormSubmitted={setFormSubmitted}
              />
            );
          })}
        </div>
        <PasswordStrength />
        <div className="flex justify-center gap-4">
          <SubmitButton title={'Create Account'} />
          <ResetButton type={'create'} />
        </div>
      </div>
    </form>
  );
};

export default CreateAccountForm;

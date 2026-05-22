import * as react_jsx_runtime from 'react/jsx-runtime';
export { S as SubscribeData, a as SubscribeProvider } from './types-CITwlflW.js';

interface EmailCaptureFormProps {
    /** Which page/product this form is on. Sent to the API for your records. */
    source: string;
    /** API route to POST to. Defaults to /api/subscribe */
    endpoint?: string;
    placeholder?: string;
    buttonLabel?: string;
    loadingLabel?: string;
    successMessage?: string;
    errorMessage?: string;
    /** className on the <form> wrapper */
    className?: string;
    inputClassName?: string;
    buttonClassName?: string;
    errorClassName?: string;
    successClassName?: string;
    /** Render prop — replace the success state with your own UI */
    renderSuccess?: () => React.ReactNode;
}
declare function EmailCaptureForm({ source, endpoint, placeholder, buttonLabel, loadingLabel, successMessage, errorMessage, className, inputClassName, buttonClassName, errorClassName, successClassName, renderSuccess, }: EmailCaptureFormProps): react_jsx_runtime.JSX.Element;

export { EmailCaptureForm, type EmailCaptureFormProps };

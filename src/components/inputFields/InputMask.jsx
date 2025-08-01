import { FormFeedback, Input } from 'reactstrap';
import { useMask } from '@react-input/mask';
import { InputLabel } from '@Components/inputLabel';

export const InputMask = ({ name, label = "", value, onChange, type = "text", feedbackText = undefined, bold = false, mask = "", replacement = null, ...rest }) => {

    const inputMaskRef = useMask({
        mask,
        replacement,
        value: value,
        showMask: true
    });

    return (
        <InputLabel label={label} feedbackText={feedbackText} bold={bold} >
            <Input
                innerRef={inputMaskRef}
                bsSize="sm"
                value={value}
                id={name}
                name={name}
                onChange={onChange}
                type={type}
                style={{ resize: "none" }}
                className={bold ? 'font-weight-bold' : ''}
                placeholder={mask}
                {...rest}
            />
            <FormFeedback>{mask}</FormFeedback>
        </InputLabel>
    )
};
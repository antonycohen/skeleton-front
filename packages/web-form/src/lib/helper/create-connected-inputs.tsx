import {FieldValues} from 'react-hook-form';
import {ControlledTextInput} from '../inputs/controlled-text-input';
import {ControlledTextareaInput} from '../inputs/controlled-textarea-input';
import {ControlledNumberInput} from '../inputs/controlled-number-input';
import {ControlledDateInput} from '../inputs/controlled-date-input';
import {ControlledSelectInput} from '../inputs/controlled-select-input';
import {ControlledRTEInput} from '../inputs/controlled-rte-input';
import {ControlledImageInput} from '../inputs/controlled-image-input';
import {ControlledCheckbox} from '../inputs/controlled-checkbox';
import {ControlledAssociativeTokenInput} from '../inputs/controlled-associative-token-input';
import {ControlledPasswordInput} from '../inputs/controlled-password-input';
import {ControlledRadioGroupInput} from '../inputs/controlled-radio-group-input';
import {ControlledLanguageInput} from '../inputs/controlled-language-input';
import {ControlledSwitchInput} from '../inputs/controlled-switch-input';
import {ControlledTokenInput} from '../inputs/controlled-token-input';
import {ControlledLanguageTokenInput} from '../inputs/controlled-language-token-input';
import {ControlledColorTokenInput} from '../inputs/controlled-color-token-input';
import {ControlledColorPickerInput} from '../inputs/controlled-color-picker-input';

export function createConnectedInputHelpers<T extends FieldValues>() {
  return {
    ControlledAssociativeTokenInput: ControlledAssociativeTokenInput<T>,
    ControlledCheckbox: ControlledCheckbox<T>,
    ControlledColorPickerInput: ControlledColorPickerInput<T>,
    ControlledColorTokenInput: ControlledColorTokenInput<T>,
    ControlledDateInput: ControlledDateInput<T>,
    ControlledImageInput: ControlledImageInput<T>,
    ControlledLanguageInput: ControlledLanguageInput<T>,
    ControlledLanguageTokenInput: ControlledLanguageTokenInput<T>,
    ControlledNumberInput: ControlledNumberInput<T>,
    ControlledPasswordInput: ControlledPasswordInput<T>,
    ControlledRadioGroupInput: ControlledRadioGroupInput<T>,
    ControlledRTEInput: ControlledRTEInput<T>,
    ControlledSelectInput: ControlledSelectInput<T>,
    ControlledTextInput: ControlledTextInput<T>,
    ControlledTextareaInput: ControlledTextareaInput<T>,
    ControlledSwitchInput: ControlledSwitchInput<T>,
    ControlledTokenInput: ControlledTokenInput<T>,
  };
}

import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import { Input } from "@chakra-ui/input";
import { Textarea } from "@chakra-ui/textarea";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/form-control";
import { NumberInput, NumberInputProps } from "@chakra-ui/number-input";
import {
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  inputType?: "textarea" | "number";
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  inputType,
  size: _,
  ...props
}) => {
  const [field, { error }] = useField(props);

  let body = <Input {...field} {...props} id={field.name} />;

  if (inputType === "textarea") {
    body = <Textarea {...field} name={props.name} id={field.name} />;
  } else if (inputType === "number") {
    body = (
      <NumberInput {...field} {...(props as NumberInputProps)} id={field.name}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    );
  }

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {body}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

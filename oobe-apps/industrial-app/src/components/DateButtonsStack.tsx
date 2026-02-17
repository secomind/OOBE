import React from "react";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import { FormattedMessage } from "react-intl";

type SelectOption<T> = {
  name: T;
  messageId: string;
};

type DateButtonsStackProps<T> = {
  value?: T | null;
  options: SelectOption<T>[];
  allDisabled: boolean;
  onChange?: (value: T) => void;
};

const DateButtonsStack: <T extends string>(
  props: DateButtonsStackProps<T>,
) => React.ReactElement<DateButtonsStackProps<T>> = ({
  value,
  options,
  allDisabled,
  onChange,
}) => (
  <Stack className="p-1 rounded bg-light" direction="horizontal" gap={1}>
    {options.map((option) => {
      const onClickHandler = onChange ? () => onChange(option.name) : undefined;
      return (
        <React.Fragment key={option.name}>
          {option.name === value ? (
            <Button
              variant="primary"
              className="text-white"
              style={{
                opacity: 1,
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
              }}
              onClick={onClickHandler}
              disabled
            >
              <FormattedMessage id={option.messageId} />
            </Button>
          ) : (
            <Button
              key={option.name}
              className="border-0 bg-light"
              style={{
                color: "var(--bs-primary)",
                cursor: "pointer",
                boxShadow: "none",
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
              }}
              onClick={onClickHandler}
              disabled={allDisabled}
            >
              <FormattedMessage id={option.messageId} />
            </Button>
          )}
        </React.Fragment>
      );
    })}
  </Stack>
);

export default DateButtonsStack;

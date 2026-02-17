import React, { forwardRef, useState } from "react";
import { Stack, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import DateButtonsStack from "./DateButtonsStack";
import { isRangePreset } from "./RangeSelect";

import "react-datepicker/dist/react-datepicker.css";
import { RangePreset } from "types";

type TopBarProps = {
  title: string;
  selectedRange: RangePreset | [Date, Date];
  isDisabled: boolean;
  onRangeChange: (range: RangePreset | [Date, Date]) => void;
  onRefresh: () => void;
};

const TopBar = ({
  title,
  selectedRange,
  isDisabled,
  onRangeChange,
  onRefresh,
}: TopBarProps) => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const CustomInput = forwardRef<HTMLButtonElement, any>(({ onClick }, ref) => (
    <Button
      className="border shadow-sm bg-white d-flex align-items-center justify-content-center"
      onClick={onClick}
      ref={ref}
      disabled={isDisabled}
      style={{ height: "38px", width: "45px", borderRadius: "8px" }}
    >
      <FontAwesomeIcon
        icon={faCalendarAlt}
        style={{ color: "var(--bs-primary)", width: "1.2em", height: "1.2em" }}
      />
    </Button>
  ));

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const finalEnd = new Date(end);
      finalEnd.setHours(23, 59, 59);
      onRangeChange([start, finalEnd]);
    }
  };

  return (
    <Stack
      direction="horizontal"
      className="justify-content-between align-items-center mb-4"
    >
      <h3
        className="fw-bold m-0"
        style={{ color: "#2d3436", letterSpacing: "-0.5px" }}
      >
        {title}
      </h3>

      <Stack direction="horizontal" gap={2}>
        <Button
          variant="light"
          className="border shadow-sm bg-white d-flex align-items-center justify-content-center"
          onClick={onRefresh}
          disabled={isDisabled}
          style={{ height: "38px", width: "42px", borderRadius: "8px" }}
        >
          <FontAwesomeIcon
            icon={faSync}
            style={{ color: "var(--bs-primary)", width: "1.1em" }}
          />
        </Button>
        <div
          className="p-1 rounded border bg-white shadow-sm d-flex align-items-center"
          style={{
            height: "38px",
            borderColor: "var(--bs-primary) !important",
          }}
        >
          <DateButtonsStack
            value={isRangePreset(selectedRange) ? selectedRange : null}
            options={[
              { name: "Day", messageId: "day" },
              { name: "Week", messageId: "week" },
              { name: "Month", messageId: "month" },
              { name: "Year", messageId: "year" },
            ]}
            onChange={onRangeChange}
            allDisabled={isDisabled}
          />
        </div>
        <div className="datepicker-wrapper">
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            monthsShown={1}
            shouldCloseOnSelect={true}
            popperPlacement="bottom-end"
            customInput={<CustomInput />}
          />
        </div>
      </Stack>
    </Stack>
  );
};

export default TopBar;

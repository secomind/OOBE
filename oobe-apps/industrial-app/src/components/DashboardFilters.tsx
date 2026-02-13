import { forwardRef } from "react";
import { ButtonGroup, Button, Stack, Navbar, Card } from "react-bootstrap";
import { ArrowRepeat, Calendar3 } from "react-bootstrap-icons";
import ReactDatePicker from "react-datepicker";
import { FormattedMessage } from "react-intl";
import { FilterType } from "../App";

interface DashboardFiltersProps {
  activeId: string; // Ovo je sada selectedSection iz App.tsx
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  onRefresh: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (update: [Date | null, Date | null]) => void;
}

const DashboardFilters = ({
  activeId,
  filterType,
  onFilterChange,
  onRefresh,
  startDate,
  endDate,
  onDateChange,
}: DashboardFiltersProps) => {
  const CustomCalendarInput = forwardRef<
    HTMLButtonElement,
    { onClick?: () => void }
  >(({ onClick }, ref) => (
    <Button
      variant="outline-primary"
      onClick={onClick}
      ref={ref}
      className="d-flex align-items-center bg-white border-primary shadow-sm p-2 ms-2"
      style={{ borderWidth: "1px", borderRadius: "8px" }}
    >
      <Calendar3 size={18} />
    </Button>
  ));

  return (
    <Card className="border-0 border-bottom rounded-0 shadow-sm mb-3 bg-light">
      <Card.Body className="p-3">
        <Stack
          direction="horizontal"
          gap={3}
          className="justify-content-between align-items-center"
        >
          <div className="d-flex flex-column">
            <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.8px" }}>
              <FormattedMessage id="monitoringSystem" defaultMessage="Monitoring System" />
            </small>
            <Navbar.Brand as="h5" className="m-0 fw-bold text-dark">
              {activeId === "line" ? (
                <FormattedMessage id="allLines" defaultMessage="All Lines (Global Views)" />
              ) : (
                <FormattedMessage id="line" defaultMessage="Line ({lineId})" values={{ lineId: activeId }} />
              )}
            </Navbar.Brand>
          </div>

          <Stack direction="horizontal" gap={2}>
            <Button
              variant="primary"
              className="border-0 shadow-sm p-2 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "#e7f0ff", width: "38px", height: "38px", borderRadius: "8px" }}
              onClick={onRefresh}
            >
              <ArrowRepeat size={20} className="text-primary" />
            </Button>
            
            <ButtonGroup
              className="bg-white border border-primary shadow-sm p-1"
              style={{ borderRadius: "10px", borderWidth: "1px" }}
            >
              {(["day", "week", "month", "year"] as FilterType[]).map((val) => {
                const isActive = filterType === val;
                return (
                  <Button
                    key={val}
                    variant={isActive ? "primary" : "white"}
                    size="sm"
                    style={{ borderRadius: "7px", fontSize: "0.85rem" }}
                    className={`px-3 border-0 text-capitalize fw-bold ${isActive ? "" : "text-primary"}`}
                    onClick={() => onFilterChange(val)}
                  >
                    <FormattedMessage id={`components.DashboardFilters.${val}`} defaultMessage={val} />
                  </Button>
                );
              })}
            </ButtonGroup>

            <div className="custom-datepicker-wrapper">
              <ReactDatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update: [Date | null, Date | null]) => {
                  onDateChange(update);
                  if (update[0]) onFilterChange("custom");
                }}
                customInput={<CustomCalendarInput />}
                popperPlacement="bottom-end"
                popperProps={{ strategy: "fixed" }}
                calendarStartDay={1}
                formatWeekDay={(name) => name.slice(0, 1)}
                renderDayContents={(day) => <span>{day}</span>}
                showPopperArrow={false}
                autoComplete="off"
              />
            </div>
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default DashboardFilters;
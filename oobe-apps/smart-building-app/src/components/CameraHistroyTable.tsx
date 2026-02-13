import { Table } from "react-bootstrap";
import { defineMessages, useIntl } from "react-intl";
import { CameraHistoryData } from "types";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const messages = defineMessages({
  event: { id: "cameraHistoryTable.event", defaultMessage: "Event" },
  behavior: { id: "cameraHistoryTable.behavior", defaultMessage: "Behavior" },
  number: { id: "cameraHistoryTable.number", defaultMessage: "Number" },
  time: { id: "cameraHistoryTable.time", defaultMessage: "Time" },
  date: { id: "cameraHistoryTable.date", defaultMessage: "Date" },
});

type Props = {
  data: (CameraHistoryData & { cameraId: string })[];
  isAllHistory: boolean;
};

const HistoryCameraTable = ({ data, isAllHistory }: Props) => {
  const intl = useIntl();

  return (
    <Table className="border-top mt-4">
      <thead>
        <tr>
          <th></th>
          <th>{messages.event.defaultMessage}</th>
          <th>
            {isAllHistory
              ? messages.behavior.defaultMessage
              : messages.number.defaultMessage}
          </th>
          <th>{messages.time.defaultMessage}</th>
          <th>{messages.date.defaultMessage}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td className="text-center align-middle">
              {row.event === "Incident" && (
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  style={{
                    color: "var(--bs-warning)",
                    width: "1em",
                    height: "1em",
                  }}
                />
              )}
            </td>
            <td>{row.event}</td>
            <td>{isAllHistory ? row.behavior : row.numberOfPeople}</td>
            <td>
              {row.datetime &&
                intl.formatTime(row.datetime, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
            </td>
            <td>
              {row.datetime &&
                intl.formatDate(row.datetime, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default HistoryCameraTable;

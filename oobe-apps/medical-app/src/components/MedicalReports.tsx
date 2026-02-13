import { Table } from "react-bootstrap";
import { FormattedDate, FormattedMessage } from "react-intl";
import { MedicalReportsData } from "types";

type MedicalReportsTableProps = {
  reports: MedicalReportsData[] | null;
};

const MedicalReports = ({ reports }: MedicalReportsTableProps) => {
  if (!reports || reports.length === 0) {
    return (
      <p>
        <FormattedMessage
          id="reports.noMedicalReports"
          defaultMessage="No medical reports available."
        />
      </p>
    );
  }

  return (
    <div>
      <h3>
        <FormattedMessage
          id="reports.tableName"
          defaultMessage="Patient Medical Reports"
        />
      </h3>

      <Table className="table border-top mt-4">
        <thead>
          <tr>
            <th>
              <FormattedMessage id="reports.type" defaultMessage="Type" />
            </th>
            <th>
              <FormattedMessage
                id="reports.date"
                defaultMessage="Date of medical service"
              />
            </th>
            <th>
              <FormattedMessage
                id="reports.facility"
                defaultMessage="Performing facility"
              />
            </th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report, id) => (
            <tr key={id}>
              <td>{report.type}</td>
              <td>
                {report.date instanceof Date ? (
                  <FormattedDate
                    value={report.date}
                    day="2-digit"
                    month="2-digit"
                    year="numeric"
                  />
                ) : (
                  report.date
                )}
              </td>
              <td>{report.facility}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MedicalReports;

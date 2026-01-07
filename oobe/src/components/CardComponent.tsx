import { Card } from "react-bootstrap";
import "./CardComponent.scss";

interface CardComponentProps {
  icon?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const CardComponent = ({ icon, title, description }: CardComponentProps) => {
  return (
    <Card className="card-component">
      <Card.Body>
        {icon && (
          <img
            src={icon}
            alt="icon"
            className={description ? "card-icon" : "card-icon-lg"}
          />
        )}
        {title && <Card.Title className="card-title">{title}</Card.Title>}
        {description && (
          <Card.Text className="card-description">{description}</Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default CardComponent;

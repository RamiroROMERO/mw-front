import { Card, CardBody, CardTitle, Row } from 'reactstrap'
import { Colxx } from '../common/CustomBootstrap'
import './styleCard.css';

const CardTotals = ({data}) => {
  return (
    <Row>
      {data.map((item, index) => (
        <Colxx xxs={12} md={4} lg={4} key={index}>
          <Card
            className="mb-3 info-card text-center"
            style={{
              borderRadius: "0.6rem",
              border: "2px solid #e5e7eb",
              background: "#ffffff",
              color: "#1f2937",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)";
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.border = "1px solid #145388";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.border = "1px solid #e5e7eb";
            }}
          >
            <CardBody>
              <CardTitle
                tag="h6"
                style={{
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.3px",
                  color: "#374151", // gris más oscuro
                }}
              >
                {item.title}
              </CardTitle>

              <h2
                style={{
                  fontWeight: "700",
                  fontSize: "2.2rem",
                  color: "#145388",
                  margin: 0,
                }}
              >
                {item.value}
              </h2>
            </CardBody>
          </Card>
        </Colxx>
      ))}
    </Row>
  )
}

export default CardTotals
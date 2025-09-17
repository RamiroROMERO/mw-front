import React from 'react'
import { Card, CardBody, CardTitle, Row } from 'reactstrap'
import { Colxx } from '../common/CustomBootstrap'
import { colorsChart } from '../charts/config'
import './styleCard.css';

const CardTotals = ({data}) => {
  return (
    <Row>
      {
        data.map(item =>{
          const numColor = Math.floor(Math.random() * 20);
          return(
          <Colxx xxs={12} lg={3}>
            <Card
              style={{
                borderRadius: "0.5rem",
                border: "none",
                background: `linear-gradient(135deg, ${colorsChart[numColor].backgroundColor}, ${colorsChart[numColor].backgroundColor})`,
                color: "white",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              className="mb-3 text-center info-card"
            >
              <CardBody>
                <CardTitle
                  tag="h5"
                  style={{
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.title}
                </CardTitle>
                <h2
                  style={{
                    fontWeight: "700",
                    fontSize: "2rem",
                    textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {item.value}
                </h2>
              </CardBody>
            </Card>
          </Colxx>
          )
        }
        )
      }
    </Row>
  )
}

export default CardTotals
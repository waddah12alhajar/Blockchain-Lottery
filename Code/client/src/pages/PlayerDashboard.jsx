import React, { useContext, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import LotteryTicket from "../components/lottery-tickets/lottery-ticket";
import DappContext from "../contexts/DappContext/DappContext";
import "./_PlayerDashboard.scss";

function PlayerDashboard() {
  const { state, address } = useContext(DappContext);
  const { contract } = state;
  const [playerLotteries, setPlayerLotteries] = useState([]);
  const [allLotteries, setAllLotteries] = useState([]);
  const playerId = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all lotteries (using contract.getAllLoteries)
        const lotteries = await contract.getAllLoteries();
        setAllLotteries(lotteries);

        // Get player lotteries
        const tickets = await contract.getPlayerLotteries();
        setPlayerLotteries(tickets);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [contract]);

  const getPlayerLotteryDetails = (lotteryId) => {
    // Find the corresponding lottery in allLotteries based on lotteryId
    const playerLotteryDetails = allLotteries.find(lottery => lottery.id.toString() === lotteryId.toString());
    return playerLotteryDetails;
  };

  return (
    <Container>
      <Row className="my-3 text-center">
        <h1>Player Dashboard</h1>
      </Row>
      <Row className="player_tickets" style={{ borderRadius: "0.5rem" }}>
        <Row className="text-center mt-4">
          <h2>My Tickets</h2>
        </Row>
        <Row xs={1} md={3} className="g-3 p-3">
          {playerLotteries.map((lottery) => {
            const playerLotteryDetails = getPlayerLotteryDetails(lottery.lottery_id.toString());
            const updatedDetails = {
                expiresAt: playerLotteryDetails.expiresAt.toNumber()*1000,
                id: playerLotteryDetails.id.toString(),
                manager: playerLotteryDetails.manager,
                name: playerLotteryDetails.lottery_name,
                price: playerLotteryDetails.price.toString(),
                prize_pool: playerLotteryDetails.current_prizePool.toString(),
            };
            return (
              <Col key={updatedDetails.id}>
                <LotteryTicket ticket={updatedDetails} />
              </Col>
            );
          })}
        </Row>
      </Row>
    </Container>
  );
}

export default PlayerDashboard;

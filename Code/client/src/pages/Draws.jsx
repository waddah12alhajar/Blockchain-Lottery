import React, { useState, useEffect, useContext } from "react";
import { Card, Col, Container, Row, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "./_Draws.scss";
import DappContext from "../contexts/DappContext/DappContext";

export default function Draws() {
  const location = useLocation();
  const [lotteryEnded, setLotteryEnded] = useState(false);
  const { name, lotteryId, expiresAt } = location.state;
  const { state } = useContext(DappContext);
  const { contract } = state;
  const lottery_name = name;
  const [winner, setWinner] = useState("");

  const [countdown, setCountdown] = useState(calculateCountdown());

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(timerInterval);
  }, []); // Run effect only once on component mount

  useEffect(() => {
    const getWinnerDetails = async () => {
      try {
        const result = await contract.getLotteryWinner(lotteryId);
        setWinner(result.winner_address);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    };

    getWinnerDetails();
  }, []);

  function calculateCountdown() {
    const now = new Date();
    const expirationTime = new Date(expiresAt);
    const timeDifference = expirationTime - now;
    if (timeDifference <= 0) {
      setLotteryEnded(true);
      // Handle if the countdown has reached or passed the expiration time
      return "Lottery has ended";
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference / 1000 / 60 / 60) % 24);
    const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
    const seconds = Math.floor((timeDifference / 1000) % 60);

    // // If time ends, return 0
    // if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    // setLotteryEnded(true);
    // }

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return (
    <Container>
      <Row className="mt-5">
        <Col></Col>
        <Col xs={10} className="text-center">
          <h1 className="text-uppercase">Lottery: {lottery_name}</h1>
          <hr />
          <h3 className="text-uppercase newSection">Current Date & Time</h3>
          <p className="current-time">{new Date().toLocaleString()}</p>
          {!lotteryEnded ? (
            <>
              <h3 className="text-uppercase newSection">Next Draw Date</h3>
              <p className="next-draw">
                {new Date(expiresAt).toLocaleString()}
              </p>
              <h3 className="text-uppercase newSection">
                Lottery to be drawn in
              </h3>
              <p className="countdown">{countdown}</p>
            </>
          ) : (
            <>
              <h3 className="text-uppercase newSection">Draw Happened On:</h3>
              <p className="next-draw">
                {new Date(expiresAt).toLocaleString()}
              </p>
              <h3 className="text-uppercase newSection">Winner: {winner}</h3>
              <p className="next-draw">
                {new Date(expiresAt).toLocaleString()}
              </p>
            </>
          )}
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}

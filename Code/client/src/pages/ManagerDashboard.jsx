import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import { ethers } from "ethers";
import "./_ManagerDashboard.scss";
import DappContext from "../contexts/DappContext/DappContext";
import LotteryTicket from "../components/lottery-tickets/lottery-ticket";

function ManagerDashboard() {
  const { state, address, signedIn, userType } = useContext(DappContext);
  const { contract } = state;
  const [lotteries, setLotteries] = useState([]);
  const [formData, setFormData] = useState({
    lottery_name: "",
    ticket_price: "",
    createdAt: new Date().toString(),
    expiresAt: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => {
    const getAllLotteries = async () => {
      try {
        const allLotteries = await contract.getAllLoteries();
        const undrawnLotteries = allLotteries.filter(
          (lottery) => !lottery.drawn
        );
        setLotteries(undrawnLotteries);
      } catch (error) {
        console.log(error);
      }
    };
    getAllLotteries();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    formData.lottery_name = "";
    formData.ticket_price = "";
    formData.expiresAt = "";
    setWarningMessage(""); // Clear warning message when closing modal
  };

  const handleShowCreateModal = () => setShowCreateModal(true);

  const createLottery = async (e) => {
    e.preventDefault();
    if (
      formData.lottery_name === "" ||
      formData.ticket_price === "" ||
      formData.expiresAt === ""
    ) {
      setWarningMessage("All fields are required");
      return;
    }

    try {
      console.log(formData)
      const date_current = new Date();
      date_current.setHours(0, 0, 0, 0);
      date_current.getTime();

      const newLottery = await contract.createLottery(
        formData.lottery_name,
        ethers.utils.parseUnits(formData.ticket_price.toString(), "ether"),
        date_current/1000,
        new Date(formData.expiresAt).getTime() / 1000
      );
      await newLottery.wait();
      const updatedLotteries = await contract.getAllLoteries();
      setLotteries(updatedLotteries);
      handleCloseCreateModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <Row className="my-3 text-center">
        <h1>Manager Dashboard</h1>
      </Row>

      {/* Lotteries List */}
      <Row className="manager-lottery" style={{ borderRadius: "0.5rem" }}>
        <Row className="text-center mt-4">
          <h2>My Lotteries</h2>
        </Row>
        <Row xs={1} md={3} className="g-3 p-3">
          {lotteries.map((_ticket) => {
            const ticket = {
              id: _ticket.id.toString(),
              name: _ticket.lottery_name,
              prize_pool: _ticket.current_prizePool,
              price: _ticket.price,
              createdAt: _ticket.createdAt.toNumber(),
              expiresAt: (_ticket.expiresAt.toNumber()*1000),
            };
            return _ticket.manager === address ? (
              <Col key={ticket.id}>
                <LotteryTicket key={ticket.id} ticket={ticket} />
              </Col>
            ) : (
              ""
            );
          })}

          {/* Create Lottery Button */}
          {signedIn && userType === "manager" && (
            <Col>
              <Card
                className="create_lottery_button"
                onClick={handleShowCreateModal}
                style={{ textAlign: "center" }}
              >
                <Card.Body>
                  <Card.Text>
                    <Row>
                      <Col>
                        {/* Addition Sign */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="50"
                          height="50"
                          fill="currentColor"
                          className="bi bi-plus-circle"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 3a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2H9v3a1 1 0 1 1-2
                        0V9H4a1 1 0 1 1 0-2h3V4a1 1 0 0 1 1-1z"
                          />
                        </svg>
                        <p className="titleText">Create New Lottery</p>
                      </Col>
                    </Row>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Row>

      {/* Create Lottery Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Lottery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="create-lottery">
            <Form.Group className="mb-3" controlId="lotteryName">
              <Form.Label>Lottery Name</Form.Label>
              <Form.Control
                type="text"
                name="lottery_name"
                onChange={handleInputChange}
                value={formData.lottery_name}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="ticketPrice">
              <Form.Label>Ticket Price(ETH)</Form.Label>
              <Form.Control
                type="text"
                name="ticket_price"
                onChange={handleInputChange}
                value={formData.ticket_price}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="expiresAt">
              <Form.Label>Expires At</Form.Label>
              <Form.Control
                type="date"
                name="expiresAt"
                onChange={handleInputChange}
                value={formData.expiresAt}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        {warningMessage && (
          <div className="alert alert-danger">{warningMessage}</div>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
          <Button variant="primary" type="submit" onClick={createLottery}>
            Create Lottery
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManagerDashboard;

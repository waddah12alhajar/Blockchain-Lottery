import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Row, Modal } from "react-bootstrap";
import DappContext from "../../contexts/DappContext/DappContext";
import { ethers } from "ethers";
import "./_lottery_ticket.scss";
import { useNavigate } from "react-router-dom";

export default function LotteryTicket(props) {
    let { id, name, expiresAt, prize_pool, price, drawn } = props.ticket;
    const [expiredTicket, setExpiredTicket] = useState(
        new Date(expiresAt) < new Date(Date.now())
    );

    console.log(drawn)
    const manager = props.manager;
    const navigate = useNavigate();

    const { signedIn, state, userType } = useContext(DappContext);
    const { contract } = state;

    const date = new Date(expiresAt);
    const expires_at =
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const handleCloseConfirmationModal = () => setShowConfirmationModal(false);
    const handleCloseStatusModal = () => setShowStatusModal(false);

    const handleConfirm = async () => {
        setShowConfirmationModal(false);

        try {
            await contract.purchaseLottery(id, {
                value: price,
            });

            // Set 'Transaction Successful' message in modal
            setModalMessage("Transaction Successful");
        } catch (error) {
            let err = error.message;
            err = err.split("'")[1];

            // Set 'Transaction Failed' message with the error in modal
            setModalMessage(`Transaction Failed: ${err}`);
            console.log(err); // log the error for debugging
        } finally {
            // Show status modal after the transaction is attempted
            setShowStatusModal(true);
        }
    };

    const buyTicket = (e) => {
        // Show confirmation modal
        setShowConfirmationModal(true);
    };

    const routeDraw = (e) => {
        // Route to draw page using navigate
        navigate("/draws/", {
            state: { name: name, lotteryId: id, expiresAt: expiresAt },
        });
    };

    const pickWinner = async (e) => {
        try {
            await contract.selectWinner(id);
            contract.on(
                "WinnerSelected",
                (lotteryId, winner, winningTicket) => {
                    console.log(lotteryId, winner, winningTicket);
                }
            );
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Card className="lottery_ticket_card" style={{ textAlign: "center" }}>
            <Card.Body>
                <Card.Title>{name}</Card.Title>
                <Card.Text>
                    <Row>
                        <Col>Prize Pool</Col>
                        <Col>
                            {ethers.utils.formatUnits(prize_pool, "ether") +
                                " ETH"}
                        </Col>
                    </Row>
                    <Row>
                        <Col>Ticket Price</Col>
                        <Col>
                            {ethers.utils.formatUnits(price, "ether") + " ETH"}
                        </Col>
                    </Row>
                    <Row>
                        <Col>Expires At</Col>
                        {window.location.pathname === "/manager" &&
                        expiredTicket ? (
                            <Col>
                                <button
                                    className="declareDraw"
                                    id={id}
                                    onClick={pickWinner}
                                >
                                    Declare Draw
                                </button>
                            </Col>
                        ) : (
                            <Col>{expires_at}</Col>
                        )}
                    </Row>
                </Card.Text>
                <div>
                    {window.location.pathname !== "/manager" &&
                        window.location.pathname !== "/player" &&
                        userType !== "manager" &&

                        signedIn && (
                            <>
                                <button
                                    className="buyLottery"
                                    id={id}
                                    onClick={buyTicket}
                                >
                                    Buy
                                </button>
                            </>
                        )}
                    {/* Only if it's on /player */}
                    {window.location.pathname === "/player" && (
                        <button
                            className="buyLottery"
                            expires={expiresAt}
                            onClick={routeDraw}
                        >
                            Show Draw
                        </button>
                    )}
                </div>

                {/* Confirmation Modal */}
                <Modal
                    show={showConfirmationModal}
                    onHide={handleCloseConfirmationModal}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Purchase</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to buy this lottery ticket?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={handleCloseConfirmationModal}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Status Modal */}
                <Modal show={showStatusModal} onHide={handleCloseStatusModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Transaction Status</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{modalMessage}</Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={handleCloseStatusModal}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Card.Body>
        </Card>
    );
}

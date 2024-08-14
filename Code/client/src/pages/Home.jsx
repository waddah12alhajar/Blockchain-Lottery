import React, { useEffect, useState } from "react";
import Cart from "./Cart";
import LotteryTicket from "../components/lottery-tickets/lottery-ticket";
import { Col, Row } from "react-bootstrap";
import { lottery_tickets } from "../dummy-tickets";
import { ethers } from "ethers";
import abi from "../contract/Lottery.json";
import CONTRACT_ADDRESS from "../Constants";

function Home() {
    const [allTickets, setAllTickets] = useState([]);

    useEffect(() => {
        const getAllLotteries = async () => {
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abi.abi,
                new ethers.providers.Web3Provider(window.ethereum)
            );

            const result = await contract.getAllLoteries();

            const currentTime = new Date().getTime();
            const updated_result = result.filter((lottery) => {
                return lottery.expiresAt.toNumber()*1000 > currentTime;
            });

            const undrawnLotteries = updated_result.filter(
                (lottery) => !lottery.drawn
            );
            
            setAllTickets(undrawnLotteries);
        };
        getAllLotteries();
    }, []);
    return (
        <Row xs={1} md={3} className="g-4 p-3">
            {allTickets.map((_ticket) => {
                const ticket = {
                    id: _ticket.id.toString(),
                    name: _ticket.lottery_name,
                    prize_pool: _ticket.current_prizePool.toString(),
                    price: _ticket.price.toString(),
                    createdAt: _ticket.createdAt.toNumber(),
                    expiresAt: _ticket.expiresAt.toNumber()*1000,
                    drawn: _ticket.drawn,
                };
                return (
                    <Col key={ticket.id}>
                        <LotteryTicket
                            key={ticket.id}
                            ticket={ticket}
                            manager={_ticket.manager}
                        />
                    </Col>
                );
            })}
        </Row>
    );
}

export default Home;

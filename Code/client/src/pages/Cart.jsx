import React from 'react';

function Cart() {
    return (
        <div className="Cart">
            <h1>Cart</h1>
            {/* Static Lottery Cards for now */}
            <table>
                <tr>
                    <th>Lottery Name</th>
                    <th>Price</th>
                </tr>
                <tr>
                    <td>Lottery_Name</td>
                    <td>100</td>
                </tr>
                <tr>
                    <td>Lottery_Name</td>
                    <td>100</td>
                </tr>
                <tr>
                    <td>Lottery_Name</td>
                    <td>100</td>
                </tr>
                <tr>
                    <td>Lottery_Name</td>
                    <td>100</td>
                </tr>
            </table>

            <div className='totalCost'>
                Total Cost: <span className='sumCost'>400</span> ETH
            </div>

        </div>
    );
}

export default Cart;
import { FC } from 'react';

interface OrderItem {
  name: string;
  price: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
  taxAmount: string;
  totalAmount: string;
}

/**
 * OrderSummary - Component that displays the order details in a summarized format
 * 
 * This component shows the items in the order, the tax, and the total amount.
 */
export const OrderSummary: FC<OrderSummaryProps> = ({ items, taxAmount, totalAmount }) => {
  return (
    <div className='order-summary'>
      <h2>Order Summary</h2>
      {items.map((item, index) => (
        <div key={index} className='order-item'>
          <span>{item.name}</span>
          <span>{item.price}</span>
        </div>
      ))}
      <div className='order-item'>
        <span>Tax</span>
        <span>{taxAmount}</span>
      </div>
      <div className='order-total'>
        <span>Total</span>
        <span>{totalAmount}</span>
      </div>
    </div>
  );
};

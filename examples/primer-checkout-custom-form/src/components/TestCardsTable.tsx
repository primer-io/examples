import { FC, useState } from 'react';
import { CopyButton } from './CopyButton';

/**
 * TestCardsTable - Component that displays test card information for merchants
 *
 * This component shows a table of test cards that can be used for testing the checkout process.
 * It includes copy functionality to easily copy card numbers to clipboard.
 */
export const TestCardsTable: FC = () => {
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  // Cards data - could be moved to a separate file or fetched from an API
  const testCards = [
    {
      type: 'Cartes Bancaires/Visa',
      number: '4000 0025 0000 1001',
      numberRaw: '4000002500001001',
      cvv: 'Any 3 digits',
      expiry: 'Any future date',
    },
    {
      type: 'Cartes Bancaires/Mastercard',
      number: '5555 5525 0000 1001',
      numberRaw: '5555552500001001',
      cvv: 'Any 3 digits',
      expiry: 'Any future date',
    },
  ];

  // Function to copy card number to clipboard
  const copyCardNumber = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber);
    setCopiedCard(cardNumber);
    setTimeout(() => {
      setCopiedCard(null);
    }, 2000); // Reset after 2 seconds
  };

  return (
    <div className='test-cards'>
      <h2>Test Cards</h2>
      <p className='test-cards-subtitle'>
        Use these cards for testing purposes only
      </p>
      <div className='test-cards-table-container'>
        <table className='test-cards-table'>
          <thead>
            <tr>
              <th>Card Type</th>
              <th>Card Number</th>
              <th>CVV</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {testCards.map((card) => (
              <tr key={card.numberRaw}>
                <td>{card.type}</td>
                <td>
                  <div className='card-number-container'>
                    <span className='card-number'>{card.number}</span>
                    <CopyButton
                      cardNumber={card.numberRaw}
                      isCopied={copiedCard === card.numberRaw}
                      onCopy={copyCardNumber}
                    />
                  </div>
                </td>
                <td>{card.cvv}</td>
                <td>{card.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * This file generates the explanation HTML content for the vaulted payment method component.
 * This keeps the main index.html file clean while still providing useful documentation.
 */

export function createExplanationElement(): HTMLDivElement {
  // Create main container
  const explanationDiv: HTMLDivElement = document.createElement('div');
  explanationDiv.className = 'explanation';

  // Create header with info icon
  const headerDiv: HTMLDivElement = document.createElement('div');
  headerDiv.className = 'explanation-header';

  // Add SVG icon
  headerDiv.innerHTML = `
    <svg class="info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--primer-color-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16V12" stroke="var(--primer-color-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="8" r="1" fill="var(--primer-color-brand)"/>
    </svg>
  `;

  // Add title
  const title: HTMLHeadingElement = document.createElement('h2');
  title.textContent = 'Vaulted Payment Method Component';
  headerDiv.appendChild(title);

  // Create content container
  const contentDiv: HTMLDivElement = document.createElement('div');
  contentDiv.className = 'explanation-content';

  // Add intro paragraph
  const introPara: HTMLParagraphElement = document.createElement('p');
  introPara.textContent =
    'This example showcases the vaulted payment method component in its default state.';
  contentDiv.appendChild(introPara);

  // Add instructions as bullet points
  const instructionsList: HTMLUListElement = document.createElement('ul');

  const instructions: string[] = [
    'Use the test cards below to vault a payment method and test the flow',
    'CVV recapture is enabled by default (can be disabled through client session in production)',
  ];

  instructions.forEach((instruction) => {
    const li: HTMLLIElement = document.createElement('li');
    li.textContent = instruction;
    instructionsList.appendChild(li);
  });

  contentDiv.appendChild(instructionsList);

  // Create test cards section
  const testCardsDiv: HTMLDivElement = document.createElement('div');
  testCardsDiv.className = 'test-cards';

  const cardsTitle: HTMLHeadingElement = document.createElement('h3');
  cardsTitle.textContent = 'Test Cards';
  testCardsDiv.appendChild(cardsTitle);

  // Create table with test cards
  testCardsDiv.innerHTML += `
    <table>
      <thead>
        <tr>
          <th>Card Type</th>
          <th>Card Number</th>
          <th>CVV</th>
          <th>Expiry Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Cartes Bancaires/Visa</td>
          <td>
            <div class="card-number-container">
              <span class="card-number">4000 0025 0000 1001</span>
              <button class="copy-button" title="Copy to clipboard" data-card-number="4000002500001001">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C15.8129 2.22698 15.3133 2.0157 14.794 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" stroke="var(--primer-color-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8" stroke="var(--primer-color-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </td>
          <td>Any 3 digits</td>
          <td>Any future date</td>
        </tr>
        <tr>
          <td>Cartes Bancaires/Mastercard</td>
          <td>
            <div class="card-number-container">
              <span class="card-number">5555 5525 0000 1001</span>
              <button class="copy-button" title="Copy to clipboard" data-card-number="5555552500001001">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C15.8129 2.22698 15.3133 2.0157 14.794 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" stroke="var(--primer-color-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8" stroke="var(--primer-color-brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </td>
          <td>Any 3 digits</td>
          <td>Any future date</td>
        </tr>
      </tbody>
    </table>
  `;

  contentDiv.appendChild(testCardsDiv);

  // Assemble the full explanation element
  explanationDiv.appendChild(headerDiv);
  explanationDiv.appendChild(contentDiv);

  // Add event listeners for copy buttons
  setTimeout(() => {
    const copyButtons: NodeListOf<HTMLButtonElement> =
      explanationDiv.querySelectorAll('.copy-button');
    copyButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        const originalTitle = button.getAttribute('title') || '';

        // Get card number (without spaces)
        const cardNumber = button.getAttribute('data-card-number') || '';

        // Copy to clipboard
        navigator.clipboard.writeText(cardNumber).then(() => {
          // Change button title temporarily
          button.setAttribute('title', 'Copied!');

          // Add copied class for animation
          button.classList.add('copied');

          // Reset after 2 seconds
          setTimeout(() => {
            button.setAttribute('title', originalTitle);
            button.classList.remove('copied');
          }, 2000);
        });
      });
    });
  }, 0);

  return explanationDiv;
}

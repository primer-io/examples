# SwiftUI and UIKit Integration Patterns for Primer iOS Checkout

Code-heavy patterns reference for integrating Primer Checkout into SwiftUI and UIKit applications.

## NavigationStack Integration

### Push to Checkout

```swift
struct ContentView: View {
    @State private var path = NavigationPath()
    let clientToken: String

    var body: some View {
        NavigationStack(path: $path) {
            CartView(onCheckout: {
                path.append("checkout")
            })
            .navigationDestination(for: String.self) { destination in
                if destination == "checkout" {
                    PrimerCheckout(
                        clientToken: clientToken,
                        onCompletion: { state in
                            if case .success = state {
                                path.append("confirmation")
                            }
                        }
                    )
                    .navigationTitle("Payment")
                    .navigationBarTitleDisplayMode(.inline)
                }
            }
        }
    }
}
```

### Navigate to Confirmation with PaymentResult

```swift
struct CheckoutView: View {
    let clientToken: String
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            PrimerCheckout(
                clientToken: clientToken,
                onCompletion: { state in
                    if case .success(let result) = state {
                        path.append(result)
                    }
                }
            )
            .navigationDestination(for: PaymentResult.self) { result in
                ConfirmationView(result: result)
            }
        }
    }
}
```

## Sheet Presentation

### Basic Sheet

```swift
struct ContentView: View {
    @State private var showCheckout = false
    let clientToken: String

    var body: some View {
        Button("Checkout") {
            showCheckout = true
        }
        .sheet(isPresented: $showCheckout) {
            PrimerCheckout(
                clientToken: clientToken,
                onCompletion: { state in
                    if case .success = state {
                        showCheckout = false
                    }
                }
            )
        }
    }
}
```

### Sheet with Post-Payment Navigation

```swift
struct ContentView: View {
    @State private var showCheckout = false
    @State private var showConfirmation = false
    @State private var paymentResult: PaymentResult?
    let clientToken: String

    var body: some View {
        Button("Checkout") { showCheckout = true }
            .sheet(isPresented: $showCheckout) {
                PrimerCheckout(
                    clientToken: clientToken,
                    onCompletion: { state in
                        switch state {
                        case .success(let result):
                            paymentResult = result
                            showCheckout = false
                            showConfirmation = true
                        case .dismissed:
                            showCheckout = false
                        case .failure:
                            break // Error shown in checkout UI
                        default:
                            break
                        }
                    }
                )
            }
            .sheet(isPresented: $showConfirmation) {
                if let result = paymentResult {
                    ConfirmationView(result: result)
                }
            }
    }
}
```

## Full-Screen Cover

```swift
struct ContentView: View {
    @State private var showCheckout = false
    let clientToken: String

    var body: some View {
        Button("Checkout") {
            showCheckout = true
        }
        .fullScreenCover(isPresented: $showCheckout) {
            NavigationView {
                PrimerCheckout(
                    clientToken: clientToken,
                    onCompletion: { state in
                        if case .success = state, case .dismissed = state {
                            showCheckout = false
                        }
                    }
                )
                .navigationTitle("Payment")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            showCheckout = false
                        }
                    }
                }
            }
        }
    }
}
```

## State Observation Patterns

### Observe Checkout State

```swift
PrimerCheckout(
    clientToken: clientToken,
    scope: { checkoutScope in
        Task {
            for await state in checkoutScope.state {
                switch state {
                case .initializing:
                    print("Loading checkout...")
                case .ready(let totalAmount, let currencyCode):
                    print("Ready: \(totalAmount) \(currencyCode)")
                case .success(let result):
                    print("Success: \(result.payment?.id ?? "")")
                case .failure(let error):
                    print("Failed: \(error.errorId)")
                case .dismissed:
                    print("Dismissed")
                }
            }
        }
    }
)
```

### Observe Card Form State

```swift
scope: { checkoutScope in
    Task {
        for await state in checkoutScope.state {
            if case .ready = state {
                if let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self) {
                    Task {
                        for await cardState in cardScope.state {
                            print("Valid: \(cardState.isValid)")
                            print("Loading: \(cardState.isLoading)")
                            print("Fields: \(cardState.displayFields)")
                            if let network = cardState.selectedNetwork {
                                print("Network: \(network)")
                            }
                            for error in cardState.fieldErrors {
                                print("Error: \(error.fieldType) - \(error.message)")
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### Observe Payment Method Selection

```swift
Task {
    for await state in checkoutScope.paymentMethodSelection.state {
        print("Methods: \(state.paymentMethods.count)")
        print("Selected: \(state.selectedPaymentMethod?.name ?? "none")")
        print("Loading: \(state.isLoading)")
    }
}
```

### Observe Apple Pay Availability

```swift
Task {
    if let applePayScope: PrimerApplePayScope = checkoutScope.getPaymentMethodScope(for: .applePay) {
        for await state in applePayScope.state {
            print("Available: \(state.isAvailable)")
            if let error = state.availabilityError {
                print("Unavailable: \(error)")
            }
        }
    }
}
```

### Observe Multi-Step Flows (Klarna)

```swift
Task {
    if let klarnaScope: PrimerKlarnaScope = checkoutScope.getPaymentMethodScope(PrimerKlarnaScope.self) {
        for await state in klarnaScope.state {
            switch state.step {
            case .loading:
                print("Loading Klarna...")
            case .categorySelection:
                print("Categories: \(state.categories)")
            case .viewReady:
                print("Klarna view ready")
            case .authorizationStarted:
                print("Authorizing...")
            case .awaitingFinalization:
                print("Awaiting finalization")
            }
        }
    }
}
```

### Observe Multi-Step Flows (ACH)

```swift
Task {
    if let achScope: PrimerAchScope = checkoutScope.getPaymentMethodScope(PrimerAchScope.self) {
        for await state in achScope.state {
            switch state.step {
            case .loading:
                print("Loading...")
            case .userDetailsCollection:
                print("Collecting user details")
            case .bankAccountCollection:
                print("Collecting bank account")
            case .mandateAcceptance:
                print("Mandate: \(state.mandateText ?? "")")
            case .processing:
                print("Processing...")
            }
        }
    }
}
```

## Custom UI Patterns

### Custom Splash Screen

```swift
scope: { checkoutScope in
    checkoutScope.splashScreen = {
        AnyView(
            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.5)
                Text("Preparing checkout...")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        )
    }
}
```

### Custom Loading Screen

```swift
checkoutScope.loading = {
    AnyView(
        VStack(spacing: 20) {
            ProgressView()
            Text("Processing payment...")
                .font(.headline)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    )
}
```

### Custom Error Screen

```swift
checkoutScope.errorScreen = { errorMessage in
    AnyView(
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 48))
                .foregroundColor(.red)
            Text("Something went wrong")
                .font(.title2)
            Text(errorMessage)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    )
}
```

### Custom Container

```swift
checkoutScope.container = { content in
    AnyView(
        VStack {
            // Custom header
            HStack {
                Image("logo")
                Spacer()
                Text("Secure checkout")
                    .font(.caption)
            }
            .padding()

            // Checkout content
            content()

            // Custom footer
            Text("Powered by Primer")
                .font(.caption2)
                .foregroundColor(.secondary)
                .padding()
        }
    )
}
```

### Custom Card Form Screen

```swift
if let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self) {
    cardScope.screen = { scope in
        AnyView(
            VStack(spacing: 16) {
                Text("Card Details")
                    .font(.title2)
                    .bold()

                scope.PrimerCardNumberField(label: "Card Number", styling: nil)
                HStack(spacing: 12) {
                    scope.PrimerExpiryDateField(label: "Expiry", styling: nil)
                    scope.PrimerCvvField(label: "CVV", styling: nil)
                }
                scope.PrimerCardholderNameField(label: "Name on Card", styling: nil)

                Button("Pay Now") {
                    scope.submit()
                }
                .frame(maxWidth: .infinity, minHeight: 50)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
            .padding()
        )
    }
}
```

### Custom Payment Method Item

```swift
checkoutScope.paymentMethodSelection.paymentMethodItem = { method in
    AnyView(
        HStack(spacing: 12) {
            if let icon = method.icon {
                Image(uiImage: icon)
                    .resizable()
                    .frame(width: 32, height: 32)
            }
            VStack(alignment: .leading) {
                Text(method.name)
                    .font(.body)
                if let surcharge = method.formattedSurcharge {
                    Text(surcharge)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 8)
    )
}
```

### Custom Apple Pay Button

```swift
if let applePayScope: PrimerApplePayScope = checkoutScope.getPaymentMethodScope(PrimerApplePayScope.self) {
    applePayScope.applePayButton = { action in
        AnyView(
            Button(action: action) {
                HStack {
                    Image(systemName: "apple.logo")
                    Text("Pay")
                }
                .frame(maxWidth: .infinity, minHeight: 50)
                .background(.black)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        )
    }
}
```

## Handle Payment Result

### Simple State Transition

```swift
struct CheckoutView: View {
    let clientToken: String
    @State private var paymentCompleted = false
    @State private var paymentResult: PaymentResult?

    var body: some View {
        if paymentCompleted, let result = paymentResult {
            ConfirmationView(result: result)
        } else {
            PrimerCheckout(
                clientToken: clientToken,
                onCompletion: { state in
                    switch state {
                    case .success(let result):
                        paymentResult = result
                        paymentCompleted = true
                    case .failure(let error):
                        print("Payment failed: \(error.errorId)")
                    case .dismissed:
                        break
                    default:
                        break
                    }
                }
            )
        }
    }
}
```

### Dismissal Pattern

```swift
PrimerCheckout(
    clientToken: clientToken,
    onCompletion: { state in
        switch state {
        case .success:
            showCheckout = false
            showConfirmation = true
        case .dismissed:
            showCheckout = false
        case .failure:
            // Error shown in checkout UI -- don't dismiss
            break
        default:
            break
        }
    }
)
```

## UIKit Integration

### Basic Presenter Usage

```swift
class CheckoutViewController: UIViewController, PrimerCheckoutPresenterDelegate {

    func showCheckout() {
        PrimerCheckoutPresenter.shared.delegate = self
        PrimerCheckoutPresenter.presentCheckout(
            clientToken: clientToken,
            from: self,
            primerSettings: PrimerSettings(paymentHandling: .auto),
            primerTheme: PrimerCheckoutTheme()
        )
    }

    func primerCheckoutPresenterDidCompleteWithSuccess(_ result: PaymentResult) {
        let vc = ConfirmationViewController(result: result)
        navigationController?.pushViewController(vc, animated: true)
    }

    func primerCheckoutPresenterDidFailWithError(_ error: PrimerError) {
        print("Failed: \(error.errorId)")
    }

    func primerCheckoutPresenterDidDismiss() {
        print("Dismissed")
    }
}
```

### Presenter with Scope Customization

```swift
PrimerCheckoutPresenter.presentCheckout(
    clientToken: clientToken,
    from: self,
    primerSettings: PrimerSettings(),
    primerTheme: PrimerCheckoutTheme(
        colors: ColorOverrides(primerColorBrand: .systemBlue)
    ),
    scope: { checkoutScope in
        checkoutScope.splashScreen = {
            AnyView(
                VStack {
                    ProgressView()
                    Text("Loading...")
                }
            )
        }
    }
)
```

### Presenter Availability Checks

```swift
// Check before presenting
guard !PrimerCheckoutPresenter.isPresenting else {
    print("Already presenting")
    return
}
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken, from: self)

// Dismiss programmatically
PrimerCheckoutPresenter.dismiss(animated: true) {
    print("Dismissed")
}
```

### 3DS Delegate Methods

```swift
extension CheckoutViewController: PrimerCheckoutPresenterDelegate {
    func primerCheckoutPresenterWillPresent3DSChallenge(_ data: PrimerPaymentMethodTokenData) {
        print("3DS starting")
    }

    func primerCheckoutPresenterDidDismiss3DSChallenge() {
        print("3DS dismissed")
    }

    func primerCheckoutPresenterDidComplete3DSChallenge(success: Bool, resumeToken: String?, error: Error?) {
        print("3DS complete: \(success)")
    }
}
```

## Common Pitfalls

### 1. Creating Configuration Objects Inside View Body

```swift
// WRONG: Recreated on every SwiftUI render
struct CheckoutView: View {
    var body: some View {
        PrimerCheckout(
            clientToken: clientToken,
            primerSettings: PrimerSettings(paymentHandling: .auto),
            primerTheme: PrimerCheckoutTheme(colors: ColorOverrides(primerColorBrand: .blue))
        )
    }
}

// CORRECT: Constants outside body
private let primerSettings = PrimerSettings(paymentHandling: .auto)
private let primerTheme = PrimerCheckoutTheme(
    colors: ColorOverrides(primerColorBrand: .blue)
)

struct CheckoutView: View {
    let clientToken: String
    var body: some View {
        PrimerCheckout(
            clientToken: clientToken,
            primerSettings: primerSettings,
            primerTheme: primerTheme
        )
    }
}
```

### 2. Accessing Scopes Before `.ready`

```swift
// WRONG: Scope is nil before .ready
scope: { checkoutScope in
    let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self) // nil!
}

// CORRECT: Wait for .ready
scope: { checkoutScope in
    Task {
        for await state in checkoutScope.state {
            if case .ready = state {
                let cardScope = checkoutScope.getPaymentMethodScope(PrimerCardFormScope.self)
                // Now configure
            }
        }
    }
}
```

### 3. Unstable View Container

```swift
// WRONG: NavigationLink destination recreated on push/pop
NavigationStack {
    NavigationLink("Checkout") {
        PrimerCheckout(clientToken: clientToken)
    }
}

// CORRECT: Sheet provides stable container
Button("Checkout") { showCheckout = true }
    .sheet(isPresented: $showCheckout) {
        PrimerCheckout(clientToken: clientToken)
    }
```

### 4. UIKit Delegate Not Set Before Presenting

```swift
// WRONG: Delegate set after presenting
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken, from: self)
PrimerCheckoutPresenter.shared.delegate = self // Too late!

// CORRECT: Set delegate first
PrimerCheckoutPresenter.shared.delegate = self
PrimerCheckoutPresenter.presentCheckout(clientToken: clientToken, from: self)
```

### 5. Expired Client Token

Client tokens are single-use and expire. Always fetch a fresh token from your server before showing checkout:

```swift
// CORRECT: Fresh token per session
func showCheckout() async {
    let token = await fetchClientToken()
    showingCheckout = true
    currentToken = token
}
```

### 6. Not Handling All Terminal States

```swift
// WRONG: Missing cases
onCompletion: { state in
    if case .success = state {
        dismiss()
    }
}

// CORRECT: Handle all terminal states
onCompletion: { state in
    switch state {
    case .success(let result):
        paymentResult = result
        showConfirmation = true
    case .failure(let error):
        print("Error: \(error.errorId)")
    case .dismissed:
        showCheckout = false
    default:
        break
    }
}
```

## Performance Tips

### 1. Avoid Recomputing Themes

Define theme constants at file scope or as static properties:

```swift
private let primerTheme = PrimerCheckoutTheme(
    colors: ColorOverrides(primerColorBrand: .blue),
    radius: RadiusOverrides(primerRadiusMedium: 12)
)
```

### 2. Minimize Scope Closure Work

The scope closure runs during view initialization. Keep it lightweight:

```swift
scope: { checkoutScope in
    // Light: set customization properties
    checkoutScope.splashScreen = { AnyView(MyLoadingView()) }

    // Start ONE Task for state observation
    Task {
        for await state in checkoutScope.state {
            if case .ready = state {
                // Configure scopes once
            }
        }
    }
}
```

### 3. Use SDK-Provided Fields When Possible

SDK fields (`PrimerCardNumberField`, etc.) handle:

- Input formatting and masking
- Validation state management
- Accessibility
- Theming integration

Only build custom field components when you need fundamentally different UI.

### 4. Prefer `onCompletion` Over AsyncStream for Terminal States

If you only need the final result, use `onCompletion` instead of observing the full state stream:

```swift
// Simpler for final result only
PrimerCheckout(
    clientToken: clientToken,
    onCompletion: { state in
        if case .success(let result) = state {
            handleSuccess(result)
        }
    }
)
```

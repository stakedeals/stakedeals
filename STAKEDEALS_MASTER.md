StakeDeals — Complete Master Development Prompt

1. PROJECT MISSION
   Build a production-ready full-stack web application called StakeDeals.
   StakeDeals is a combined:
1. E-commerce platform
1. Products and services marketplace
1. SD Patron member network
1. SD Partner seller/service-provider marketplace
1. 10-level Unilevel MLM system
1. SDP reward system
1. SDC reward and distribution system
1. SDC pool distribution system
1. Internal SDP/SDC wallet system
1. PKR withdrawal system
1. Admin/staff management platform
1. Customer order-tracking system
   This must be a real working production-ready full-stack application, not a UI prototype, mockup, or frontend-only implementation. Every feature defined in this specification must have its corresponding real frontend, backend, database, server-side business logic, APIs/services, and persistent data behavior as applicable.
   Implement the complete:
   • frontend
   • backend
   • database
   • authentication
   • authorization
   • RBAC
   • genealogy
   • reward engine
   • wallet ledger
   • SDC pool engine
   • rank engine
   • marketplace
   • order system
   • return system
   • withdrawal system
   • audit history
   • notifications
   • validation
   • testing
   • scheduled processing
   Do not use fake/mock financial calculations in production logic.

---

2. TECHNOLOGY REQUIREMENTS
   Use the latest stable, mutually compatible versions available at implementation time.
   Do not unnecessarily downgrade packages.
   Use the existing project ecosystem as the baseline, while updating packages to current stable compatible versions when implementation begins.
   Preferred technology:
   • Next.js — latest stable
   • React — latest stable compatible with Next.js
   • TypeScript — latest stable
   • Tailwind CSS — latest stable
   • PostgreSQL
   • Neon PostgreSQL/serverless database
   • Drizzle ORM
   • Drizzle Kit
   • Auth.js / NextAuth
   • Zod
   • React Hook Form
   • Zustand
   • Radix UI
   • Lucide React
   • Recharts
   • Stripe
   • PayPal
   • UploadThing
   • Resend
   • React Email
   • Nodemailer
   • next-intl
   • next-themes
   • date-fns
   • Embla Carousel
   • bcryptjs
   • dotenv
   • tsx
   • ESLint
   • PostCSS
   • Turbopack for development
   Avoid deprecated, abandoned, experimental, or incompatible packages.

---

3. ARCHITECTURAL PRINCIPLES
   Use:
   • Next.js App Router
   • Server Components by default
   • Client Components only when required
   • Server Actions and/or secure Route Handlers for mutations
   • Strong server-side validation
   • Zod schemas
   • PostgreSQL transactions
   • Immutable financial/reward history
   • Explicit state machines
   • Role-based access control
   • Permission-based authorization
   • Audit logs
   • Idempotent financial operations
   • Database constraints
   • Proper indexes
   • Exact NUMERIC/DECIMAL financial storage
   • Secure webhook verification
   • Extensible payment-provider architecture
   • Extensible payout-provider architecture
   • Domain-oriented services
   Never trust client-side values for:
   • prices
   • wallet balances
   • rewards
   • commissions
   • SDC
   • SDP
   • platform fees
   • withdrawals
   • roles
   • permissions
   • genealogy
   • rank eligibility
   • pool calculations
   All sensitive calculations must happen server-side.

---

4. USER MODEL
   There is ONE underlying member/user account.
   Do NOT create separate Patron and Partner accounts.
   Every registered member begins as an:
   SD Patron
   After Admin approval of a Partner application, the same account receives additional:
   SD Partner capabilities
   The following remain attached to the same user ID:
   • account
   • sponsor
   • genealogy
   • rank history
   • SDP wallet
   • SDC wallet
   • orders
   • purchases
   • rewards
   • referrals
   • Partner status
   • Partner listings
   • withdrawals
   • financial history
   Never create a second account when Patron status becomes Partner status.

---

5. PUBLIC REGISTRATION
   Public users can register as SD Patrons.
   Public registration MUST NOT allow users to assign themselves privileged administrative roles.
   Users cannot register themselves as:
   • Owner
   • Product Manager
   • Cash Manager
   • Partner Manager
   • SD Patron Manager
   • other administrative/staff roles
   Administrative roles are assigned only by authorized administration.

---

6. SPONSOR / REFERRAL
   Every member may have a sponsor/referrer.
   Registration may contain a sponsor/referral ID.
   If a valid sponsor is supplied:
   • assign that sponsor.
   If no valid sponsor is supplied:
   • assign the Admin-configured default sponsor user ID.
   The sponsor relationship becomes part of the permanent genealogy.
   Validate:
   • sponsor exists
   • sponsor is eligible
   • user cannot sponsor themselves
   • genealogy cannot create cycles
   Store appropriate sponsor history/audit information.

---

7. MEMBER-CREATED SIGNUP
   An existing member can create a new user from the dashboard.
   Support:
   • normal/public registration
   • referral registration
   • member-created signup
   • signup funded through eligible SDP/SDC
   The architecture must remain extensible for future signup/payment methods.
   Member-created signup must:
   • establish correct sponsor relationship
   • validate available balance
   • create required ledger entries
   • prevent duplicate charging
   • use database transactions
   • preserve audit history
   Never modify wallet balances directly without ledger entries.

---

8. ADMINISTRATIVE ROLES
   Owner
   Super Admin with complete authority.
   Can manage:
   • global settings
   • staff
   • roles
   • permissions
   • users
   • products
   • categories
   • services
   • Partners
   • wallets
   • withdrawals
   • rewards
   • MLM configuration
   • pools
   • ranks
   • reports
   • audit logs
   • system settings
   Product Manager
   Responsible for:
   • reviewing products
   • approving/rejecting listings
   • categories
   • product moderation
   • product-related configuration
   Cash Manager
   Responsible for:
   • withdrawal requests
   • payout review
   • manual payouts
   • financial review
   • entering TRX IDs
   • marking withdrawals PAID
   Partner Manager
   Responsible for:
   • SD Partner applications
   • approval/rejection
   • Partner status management
   SD Patron Manager
   Responsible for:
   • reviewing applicable Patron approvals
   • approving/rejecting applicable users

---

9. PERMISSION SYSTEM
   Do not rely only on role names.
   Implement:
   • roles
   • permissions
   • user-role relationships
   • role-permission relationships
   Example permissions:
   • users.view
   • users.edit
   • users.approve
   • products.create
   • products.approve
   • products.edit
   • orders.view
   • rewards.view
   • rewards.manage
   • wallets.view
   • wallets.manage
   • sdc.issue
   • sdc.transfer
   • pools.create
   • pools.settle
   • ranks.manage
   • withdrawals.view
   • withdrawals.process
   • partners.approve
   • platform-settings.manage
   All sensitive authorization must be enforced server-side.
   Client-side role checks are only for UI presentation and must never be considered security.

---

10. SINGLE MEMBER/PARTNER DASHBOARD
    There must be ONE dashboard.
    Standard SD Patron features include:
    • Overview
    • Profile
    • Referral Link
    • Genealogy
    • Members
    • SDP Wallet
    • SDC Wallet
    • Rewards
    • Orders
    • Purchases
    • Withdrawals
    • Signup
    • Become SD Partner
    • Settings
    After Partner approval, additional capabilities become available:
    • Products
    • Services
    • Inventory
    • Availability
    • Partner Orders
    • Partner Sales
    • Partner Agreement
    • Listing Management
    Do NOT create an unrelated Partner portal.

---

11. SD PARTNER APPLICATION
    Any SD Patron can request:
    Become an SD Partner
    Collect at minimum:
    • business name
    • address
    • phone number
    Application states:
    • PENDING
    • APPROVED
    • REJECTED
    • SUSPENDED
    Partner Manager reviews the application.
    After approval:
    • enable Partner capabilities on the same user
    • allow payout details where applicable
    • allow product/service listings
    • preserve application history

---

12. PRODUCTS
    Products support:
    • title
    • slug
    • description
    • images
    • category
    • child category
    • SKU
    • price
    • SDC price where applicable
    • stock
    • inventory
    • seller
    • shipping information
    • return eligibility
    • SDP configuration
    • SDC configuration
    • purchase context
    • approval status
    Admin manages categories.

---

13. PRODUCT PURCHASE CONTEXT
    Products may be configured for:
1. Normal shopping
1. Signup purchasing
1. Both
   The application must enforce purchase context.
   The SD Patron signup category is intended for mandatory/signup-related products.
   Products in this category must not automatically become ordinary shopping products.

---

14. SERVICES
    Approved SD Partners can create services.
    Support:
    • service name
    • description
    • images
    • category
    • pricing
    • SDC price
    • availability
    • terms
    • provider
    • status
    • approval
    • order/booking information
    Design the service architecture so future scheduling/booking functionality can be added without replacing the core marketplace architecture.

---

15. PARTNER LISTING MANAGEMENT
    Approved Partners can manage:
    • products
    • services
    • prices
    • descriptions
    • images
    • inventory
    • availability
    • orders
    • fulfillment
    All Partner functionality is inside the unified dashboard.
    Admin can approve, reject, suspend, or moderate listings.

---

16. SD PARTNER AGREEMENT / PLATFORM FEE
    Platform fee is NOT a universal hard-coded value.
    Admin defines the applicable fee according to the individual SD Partner agreement.
    The fee is represented in SDC.
    The system must support:
    • Partner
    • fee amount in SDC
    • effective date
    • status
    • agreement reference/version
    • configured fee recipient user ID
    The applicable fee must be snapshotted into each transaction.
    Later agreement changes must not rewrite historical transactions.
    Do not invent a fee amount or percentage.

---

17. INTERNAL SDC MARKETPLACE
    Customers can use eligible SDC to purchase:
    • products
    • services
    • Partner marketplace offerings
    • permitted signup transactions
    Marketplace transactions must create immutable ledger entries.
    A transaction must identify:
    • buyer
    • seller
    • gross SDC
    • platform fee
    • Partner net SDC
    • fee recipient
    • order/service reference
    • ledger references
    • timestamp

---

18. SDP AND SDC
    SDP and SDC are separate concepts.
    SDP
    SDP is the buyer-side reward.
    It belongs to the purchaser/member who makes the applicable qualifying purchase.
    SDP does NOT distribute through the 10-level tree.
    SDC
    SDC is the distributed reward.
    SDC participates in:
1. the 10-level Unilevel tree
1. the SDC pool mechanism
   Never combine SDP and SDC into one reward balance.

---

19. ADMIN-CONFIGURABLE SDP/SDC PKR VALUES
    Admin can configure the current PKR value of:
    • SDP
    • SDC
    Do not hard-code these values.
    Every relevant financial transaction must snapshot the value used.
    Historical transactions must not change because Admin later changes the current value.

---

20. PAYMENT CONFIRMATION
    Current payment handling is manual.
    Flow:
    Order
    → Payment
    → Admin verifies payment
    → Admin confirms payment received
    → applicable rewards generated
    Creating an order alone does NOT finalize rewards.
    Payment confirmation must be idempotent.

---

21. FUTURE PAYMENT PROVIDERS
    Architect payment processing so future integrations can include:
    • Stripe
    • PayPal
    • JazzCash
    • Easypaisa
    • local banks
    • other providers
    Provider-specific code must be separated from the internal payment/reward engine.
    Future webhooks should ultimately trigger the same internal payment-confirmed event.
    Do not claim current automatic payment confirmation where it does not exist.

---

22. ORDER SYSTEM
    Orders can contain multiple products.
    Each product is an individual Order Item.
    Order Item must preserve:
    • product
    • seller
    • quantity
    • unit price
    • total
    • purchase context
    • reward configuration snapshot
    • SDC configuration snapshot
    • SDP configuration snapshot
    • shipping information
    • return information
    Rewards must reference the specific Order Item.

---

23. CUSTOMER ORDER TRACKING
    Implement a complete customer-facing order tracking system.
    Create a public:
    /track-order
    page.
    A customer enters an Order Number and can view the appropriate order tracking information.
    Order numbers must NOT be sufficient by themselves to expose sensitive customer information.
    Apply appropriate verification and rate limiting.
    Tracking information
    Where applicable show:
    • Order Number
    • Order Date
    • Order Items
    • Product Name
    • Quantity
    • Seller/SD Partner
    • Payment Status
    • Order/Fulfillment Status
    • Shipping Date
    • Carrier
    • Shipment Tracking Number
    • Current delivery status
    • Return status
    • relevant timestamps
    Order status timeline
    Support statuses such as:
    ORDER_PLACED
    → PAYMENT_PENDING
    → PAYMENT_CONFIRMED
    → PROCESSING
    → SHIPPED
    → IN_TRANSIT
    → OUT_FOR_DELIVERY
    → DELIVERED
    Additional states may include:
    RETURN_REQUESTED
    → RETURN_APPROVED
    → RETURNED
    → REFUNDED
    and:
    CANCELLED
    Do not force every order through every state.
    Implement a valid state machine.
    Status history
    Every status change creates an immutable history record containing:
    • Order ID
    • previous status
    • new status
    • changed by
    • timestamp
    • note/reason
    • shipment/return reference where applicable
    Never overwrite status history.
    Shipment management
    Authorized Admin/Partner users can:
    • set shipping date
    • enter carrier
    • enter tracking number
    • update shipping status
    • add delivery notes
    Design for future shipping-carrier API integrations.
    Member dashboard
    Logged-in members can view:
    • My Orders
    • order details
    • current status
    • full timeline
    • shipment information
    • return information
    Security
    Never expose another customer's order by guessing an order number.
    Use server-side authorization.
    Rate-limit public tracking attempts.
    Do not expose unnecessary:
    • wallet data
    • payment credentials
    • private customer information
    • internal administrative information
    Reward integration
    Shipping Date is a critical reward event.
    The SDC waiting/return period is:
    Shipping Date = Day 1
    Day 10 = final day
    Day 11 = outside the 10-day period
    Shipping date must be stored explicitly.
    Once reward maturity processing has started, normal status edits must not silently rewrite the historical shipping date.
    Legitimate corrections require an audited correction workflow.

---

24. PAYMENT → REWARD FLOW
    Required conceptual sequence:
    Order
    ↓
    Payment
    ↓
    Admin confirms payment
    ↓
    SDP generation
    ↓
    SDC generation
    ↓
    10-level SDC tree distribution
    ↓
    Applicable SDC pool contribution
    All records must reference the originating Order and Order Item.

---

25. TEN-LEVEL UNILEVEL GENEALOGY
    StakeDeals uses exactly 10 identifiable MLM levels.
    L1 = direct sponsor
    L2 = sponsor's sponsor
    ...
    L10 = tenth upline.
    The genealogy engine must reliably resolve all ten levels.
    Each SDC tree distribution must identify:
    • originating member
    • recipient
    • level
    • amount
    • order
    • order item
    • applicable rule
    • configuration snapshot
    • timestamp
    Never collapse L1-L10 into one generic reward.

---

26. FIXED SDC TREE AMOUNTS
    SDC tree rewards use fixed amounts only.
    There are NO percentage-based MLM SDC rules.
    Each level has an independent fixed amount:
    • L1
    • L2
    • L3
    • L4
    • L5
    • L6
    • L7
    • L8
    • L9
    • L10
    Example amounts are configuration examples only.
    Do not hard-code them.
    Admin configures the actual values.

---

27. PRODUCT-SPECIFIC SDC OVERRIDE
    There is a system/default SDC rule.
    A product can have a product-specific SDC rule.
    Priority:
    Product-specific rule
    overrides:
    System/default rule
    Only fixed SDC amounts are supported.
    Snapshot the rule used at reward generation.

---

28. MISSING UPLINE FALLBACK
    If an applicable upline level does not exist:
    the SDC for that missing level goes to the:
    Admin-configured fallback recipient user ID.
    This does NOT automatically mean Owner/Super Admin.
    Admin explicitly configures the recipient.
    Record:
    • missing level
    • originating member
    • order
    • order item
    • amount
    • recipient
    • rule
    • ledger entry
    • timestamp
    Never silently lose the amount.

---

29. SDC TREE VS SDC POOL
    SDC tree distribution and SDC pool contribution are distinct mechanisms.
    Conceptually:
    Qualifying Sale
    ├── SDP → Buyer
    └── SDC
    ├── 10-Level Tree Distribution

└── SDC Pool Contribution
The system must clearly identify the purpose/source of every SDC movement.
Do not accidentally double-credit or double-debit SDC.
The exact accounting relationship between tree distribution and pool contribution must follow the configured business model and must not be invented if not specified.

---

30. SDC MATURITY
    SDC generated from qualifying sales has a waiting/maturity lifecycle.
    States include:
    WAITING / IMMATURE
    and:
    MATURED
    The waiting period is based on shipping date.
    Shipping Date = Day 1.
    Day 10 = final waiting/return day.
    After the applicable period is completed without reversal, the SDC becomes matured/eligible according to the relevant business rules.
    Each SDC must preserve:
    • generated_at
    • maturity_start
    • maturity_end
    • state
    • source order
    • source order item
    • source reward
    • pool relationship where applicable
    • reversal status

---

31. RETURN PERIOD
    Return period:
    10 calendar days from shipping date.
    Shipping date = Day 1.
    Day 10 = final return day.
    Day 11 = outside return period.
    Return eligibility is calculated per Order Item.

---

32. RETURN PROCESS
    Returns are item-level.
    Support:
    • returned quantity
    • partial return
    • return status
    • return date
    • shipping date
    • return deadline
    • reason
    • approval
    • reversal reference
    A return affects only the returned item/quantity.

---

33. REWARD REVERSAL
    If a qualifying sale/item/quantity is returned under the applicable rules:
    reverse ALL rewards generated by the affected sale/quantity.
    This may include:
    • SDP
    • SDC
    • SDC tree distributions
    • SDC pool contribution
    Do not leave affected rewards valid after the underlying sale is reversed.

---

34. IMMUTABLE REWARD HISTORY
    Never delete or rewrite original reward transactions.
    Original:
    • SDP
    • SDC
    • tree distributions
    • pool contributions
    remain permanently traceable.
    Create separate reversal/compensating records.
    Example:
    Original reward
    ↓
    Return
    ↓
    Reward reversal
    The original transaction remains unchanged.

---

35. SDC PROVENANCE
    Every SDC amount must be traceable.
    The system must answer:
    • where it originated
    • which order generated it
    • which order item generated it
    • originating member
    • reward rule
    • MLM level
    • pool
    • maturity state
    • distribution
    • spending
    • transfer
    • withdrawal
    • reversal
    Never create unexplained SDC.

---

36. SDC WALLET VS RANK QUALIFICATION
    This is a critical business rule.
    The system must treat these as TWO SEPARATE concepts:
    SDC Wallet
    The user's current actual usable SDC balance.
    Rank-Qualifying SDC
    A historical metric representing qualifying SDC generated through qualifying business activity.
    Do NOT use current SDC wallet balance to determine rank qualification.
    Do NOT create a separate locked "rank SDC wallet".
    Do NOT reserve SDC for rank purposes.

---

37. QUALIFYING BUSINESS-GENERATED SDC
    When a qualifying business activity generates SDC:
1. Credit the SDC to the user's normal SDC wallet.
1. Record the qualifying amount in the user's Rank Qualification Ledger.
   Example:
   Purchase generates:
   500 SDC
   Record:
   SDC Wallet +500
   and:
   Rank-Qualifying SDC +500
   A later qualifying event generates:
   300 SDC
   Record:
   SDC Wallet +300
   and:
   Rank-Qualifying SDC +300
   Historical rank metric:
   800 SDC
   The actual wallet SDC remains freely usable.

---

38. QUALIFYING SDC IS NOT LOCKED
    Once qualifying SDC has been recorded for rank qualification, that SDC becomes ordinary usable wallet SDC.
    The system must NOT:
    • lock it
    • reserve it
    • restrict it
    • create a separate rank wallet
    • prevent spending
    • prevent transfer
    • prevent withdrawal
    Rank qualification is a historical metric, not a restriction on wallet usage.

---

39. SPENDING DOES NOT REDUCE RANK QUALIFICATION
    If a member has historically generated:
    1,000 qualifying SDC
    and later spends:
    700 SDC
    the wallet balance decreases according to the wallet ledger.
    The historical rank metric remains:
    1,000 qualifying SDC
    Spending does not erase the historical qualifying activity.

---

40. WITHDRAWAL DOES NOT REDUCE HISTORICAL RANK QUALIFICATION
    If a member has:
    1,000 qualifying SDC
    and withdraws:
    600 SDC
    then after successful payout:
    Available SDC = 400
    but:
    Historical Rank-Qualifying SDC = 1,000
    The withdrawn SDC is consumed permanently, but the historical rank metric remains.

---

41. RANK QUALIFICATION LEDGER
    Create a dedicated historical Rank Qualification Ledger.
    This is NOT a second wallet.
    Each record should contain:
    • qualification record ID
    • user ID
    • qualifying SDC amount
    • source type
    • source transaction ID
    • order/order item where applicable
    • qualification date
    • relevant evaluation period
    • timestamp
    The Rank Engine aggregates these records.
    Do not reduce them merely because the corresponding SDC was spent, transferred, or withdrawn.

---

42. RANK-GENERATING SOURCES
    Only qualifying business activity contributes to the rank-qualification metric.
    Examples may include:
    • qualifying purchases
    • qualifying business-generated SDC
    • qualifying MLM/tree SDC generation
    The exact qualifying sources must follow configured business rules.
    Do not invent additional sources.

---

43. ADMIN-ISSUED SDC AGAINST CASH
    Admin may generate SDC when a member requires additional SDC and provides the required cash/payment to Admin.
    This is an:
    Admin-controlled SDC issuance against confirmed payment.
    It is NOT an "advance" in the accounting sense.
    Flow:
    Member requests SDC
    ↓
    Member provides required cash/payment
    ↓
    Admin confirms payment received
    ↓
    Admin generates required SDC
    ↓
    Admin credits SDC to member wallet

---

44. ADMIN SDC ISSUANCE AUTHORIZATION
    Only users with the appropriate SDC-management permission may issue SDC.
    Enforce authorization server-side.
    Never trust client-side Admin-role checks.
    Example permission:
    sdc.issue
    The permission must be checked before:
    • generating SDC
    • creating issuance records
    • crediting the recipient wallet

---

45. ADMIN SDC ISSUANCE RECORD
    Admin must never directly edit the recipient wallet balance.
    Every issuance creates an immutable issuance record containing at minimum:
    • issuance ID
    • recipient user ID
    • issuing Admin user ID
    • SDC amount
    • cash/payment amount received
    • applicable SDC-to-PKR value
    • payment/reference information
    • reason
    • note
    • timestamp
    • status
    • wallet credit transaction ID
    Historical issuance records cannot be deleted.

---

46. ADMIN-ISSUED SDC IS NORMAL WALLET SDC
    After payment is confirmed and the SDC is credited:
    Admin-issued SDC behaves like normal usable SDC.
    It can be used for permitted:
    • signup
    • product purchases
    • service purchases
    • marketplace purchases
    • member transfer, if enabled
    • withdrawal
    • other permitted SDC functions
    It is not temporary.
    It does not need to be returned to Admin.

---

47. ADMIN-ISSUED SDC DOES NOT COUNT FOR RANK
    Admin-issued SDC against cash/payment does NOT increase the Rank Qualification Ledger.
    Example:
    Member pays Admin for:
    5,000 SDC
    Admin credits:
    5,000 SDC
    Result:
    SDC Wallet +5,000
    Rank-Qualifying SDC +0
    The member can use the 5,000 SDC normally.
    The issuance itself does not qualify the member for rank.

---

48. SDC POOL DISTRIBUTION DOES NOT COUNT FOR RANK
    SDC received from pool distribution is normal usable SDC.
    However:
    Pool-Distributed SDC = 0 Rank-Qualifying SDC
    Pool distribution does not increase the Rank Qualification Ledger.
    The member can freely use the pool SDC.
    Do not create a restricted pool wallet.

---

49. MEMBER-TO-MEMBER SDC TRANSFER
    The system may support SDC transfers between users.
    If enabled, eligible users may transfer available SDC to another eligible user.
    Example:
    User A:
    10,000 SDC
    Transfers:
    3,000 SDC
    to User B.
    Result:
    User A:
    7,000 SDC
    User B:
    +3,000 SDC
    The transfer creates NO new SDC.
    It only moves existing SDC ownership.

---

50. MEMBER TRANSFER DOES NOT CREATE RANK QUALIFICATION
    A member-to-member transfer:
    • does not create SDC
    • does not create SDP
    • does not generate MLM rewards
    • does not create a pool contribution
    • does not increase rank qualification
    • does not reset/rewrite previous rank qualification
    Example:
    User A has:
    2,000 historical qualifying SDC
    User A transfers:
    1,000 SDC
    to User B.
    Result:
    User A Rank Qualification:
    2,000
    User B Rank Qualification:
    unchanged

---

51. MEMBER TRANSFER ACCOUNTING
    A transfer is:
    Sender -X SDC
    and:
    Recipient +X SDC
    Total system SDC does not increase.
    Both ledger entries must be created atomically.
    Either both succeed or neither succeeds.
    Prevent:
    • duplicate transfer
    • self-transfer
    • insufficient balance
    • unauthorized transfer
    • transfer of unavailable/pending SDC

---

52. MEMBER TRANSFER TRACEABILITY
    Every transfer must preserve:
    • transfer ID
    • sender
    • recipient
    • amount
    • timestamp
    • sender ledger entry
    • recipient ledger entry
    • status
    • note/reference where applicable
    • reversal reference where applicable
    Historical transfer records must remain auditable.

---

53. MEMBER TRANSFER FEATURE CONTROL
    Implement an Admin-controlled feature setting:
    ALLOW_MEMBER_SDC_TRANSFER
    Default:
    FALSE
    When disabled:
    • members cannot transfer SDC.
    When enabled:
    • eligible members may transfer according to the validation rules.
    Do not invent transfer fees, minimums, maximums, or daily limits unless explicitly configured later.

---

54. RANK QUALIFICATION IS NOT CURRENT BALANCE
    The Rank Engine MUST NEVER use:
    Current SDC Wallet Balance
    as the rank metric.
    It must use:
    Historical Rank-Qualifying SDC
    derived from qualifying records.
    Example:
    • Purchase 1 → +500 qualifying SDC
    • Purchase 2 → +300 qualifying SDC
    • Tree reward → +200 qualifying SDC
    Rank metric:
    1,000 SDC
    Later:
    • spend 400
    • transfer 200
    • withdraw 100
    Rank metric remains:
    1,000 SDC

---

55. RANK SYSTEM
    Ranks are Admin-defined.
    Admin controls:
    • rank name
    • rank order
    • requirements
    • SDP requirements
    • SDC requirements
    • additional future requirements
    Rank Qualification — SDP and SDC Are Both Required
    Each rank may have an Admin-configured SDP requirement and SDC requirement.
    A member qualifies for a rank only when BOTH requirements are satisfied.
    • The required SDP threshold must be met.
    • The required SDC qualification threshold must be met.
    • SDP cannot substitute for SDC.
    • SDC cannot substitute for SDP.
    • Meeting only one of the two requirements does not qualify the member for the rank.
    • Exact SDP and SDC thresholds are configurable by Admin for each rank and must not be hard-coded.
    Example:
    If a rank requires 10,000 SDP + 5,000 SDC:
    • 12,000 SDP + 4,000 SDC → Does not qualify.
    • 8,000 SDP + 6,000 SDC → Does not qualify.
    • 10,000 SDP + 5,000 SDC → Qualifies, assuming all other configured rank requirements are satisfied.
    The SDC requirement uses the separate rank-qualification SDC metric defined in this specification. It does not depend on the member's current SDC wallet balance, and qualifying SDC is not locked or earmarked for rank purposes.
    Do not invent numerical requirements.

---

56. MONTHLY RANK EVALUATION
    Rank evaluation occurs monthly/calendar basis.
    The Rank Engine:
1. determines evaluation period
1. calculates qualifying SDP
1. calculates qualifying historical SDC
1. excludes non-qualifying SDC sources
1. evaluates requirements
1. determines highest qualified rank
1. supports multiple-rank promotion
1. limits demotion to one rank
1. creates immutable rank history

---

57. MULTIPLE-RANK PROMOTION
    A member may qualify for multiple ranks during one evaluation.
    Example:
    Current Rank = Rank 1
    If the member qualifies for Rank 4:
    promote directly to Rank 4.
    Do not force sequential promotion through Rank 2 and Rank 3.

---

58. RANK DEMOTION
    A member may be demoted by only one rank during a single evaluation.
    Record:
    • previous rank
    • resulting rank
    • evaluation
    • reason/qualification result
    • timestamp

---

59. SDC POOL
    Admin can create/manage SDC pools.
    Each pool contains:
    • ID
    • name
    • start date
    • end date
    • status
    • participating ranks
    • undistributed recipient
    • snapshots
    • contributions
    • distributions
    • settlement information
    Pool dates are Admin-defined.
    Do not assume calendar-month pools.

---

60. POOL LIFECYCLE
    States:
    ACTIVE
    → ENDED_WAITING
    → SETTLED
    ACTIVE
    Accept eligible contributions.
    ENDED_WAITING
    Pool end date has arrived.
    No NEW SDC contributions are accepted.
    Existing immature contributions remain traceable.
    The pool waits for required maturity/resolution.
    SETTLED
    All required contribution conditions are satisfied and the pool has been distributed.
    Historical records remain permanently available.

---

61. POOL CONTRIBUTION
    Every pool contribution must reference:
    • pool
    • originating SDC
    • order
    • order item
    • originating user
    • amount
    • maturity status
    • contribution timestamp
    • reversal status
    Original contribution amount is immutable.
    Return/reversal creates separate records.

---

62. POOL MATURITY
    When a pool ends:
    • reject new contributions
    • retain existing waiting contributions
    • continue maturity tracking
    • resolve returns/reversals
    • wait for applicable contributions to become mature/resolved
    • then settle
    Use the established 10-day maturity/return rule.
    Do not invent another maturity period.

---

63. POOL RANK SNAPSHOT
    At pool start:
1. Determine Admin-selected participating ranks.
1. Determine eligible members in those ranks.
1. Capture immutable rank/member snapshots.
   Later rank changes must NOT alter the pool snapshot.
   Pool settlement uses the captured snapshot.

---

64. POOL DISTRIBUTION
    The pool is distributed equally among participating ranks.
    Each rank's share is then divided equally among captured eligible members of that rank.
    Conceptually:
    Pool Total
    ↓
    Equal share per participating rank
    ↓
    Equal member share within each rank
    Do not use current rank status during settlement if it differs from the pool snapshot.

---

65. POOL UNASSIGNED SHARE
    Each pool has an Admin-selected undistributed recipient user ID.
    If a rank's share cannot be distributed to eligible captured members:
    send the undistributed amount to the configured recipient.
    Record:
    • pool
    • rank
    • original share
    • reason
    • recipient
    • amount
    Never silently discard the amount.

---

66. POOL DISTRIBUTION DOES NOT QUALIFY FOR RANK
    Pool-distributed SDC is explicitly excluded from Rank Qualification.
    It becomes normal usable SDC in the member's wallet.
    It does not increase the historical Rank Qualification Ledger.

---

67. WALLET SYSTEM
    Implement separate:
    SDP Wallet
    Show:
    • total earned
    • available
    • pending
    • withdrawn
    • reversed
    SDC Wallet
    Show:
    • total earned
    • available
    • pending
    • withdrawn
    • reversed
    Never combine SDP and SDC balances.

---

68. WALLET LEDGER
    Every wallet movement must create an immutable ledger entry.
    Each entry should contain:
    • wallet owner
    • asset type
    • credit/debit
    • amount
    • source type
    • source ID
    • balance effect
    • status
    • timestamp
    • reference
    • reversal/compensation reference where applicable
    Use transactional synchronization if materialized balances are maintained.
    Never allow client-side balance editing.

---

69. SDC SOURCES AND THEIR RANK EFFECT
    The system must explicitly distinguish SDC source types.
    SDC Source Wallet Rank Qualification
    Qualifying business-generated SDC Yes Yes, if qualifying
    10-level qualifying tree SDC Yes Yes, if qualifying
    Admin cash-issued SDC Yes No
    Pool-distributed SDC Yes No
    Member-to-member transferred SDC Yes No new qualification
    Reversal Adjusts wallet Does not create new qualification
    The historical rank record is created when qualifying activity occurs.
    It does not move around with later wallet transactions.

---

70. USING SDP/SDC FOR PURCHASES
    Eligible SDP/SDC may be used for permitted purchases.
    Marketplace products/services from SD Partners use:
    SDC only
    Every spend creates wallet ledger entries.
    Do not directly modify numeric balances.

---

71. SIGNUP USING SDP/SDC
    Members may use eligible SDP/SDC through the dashboard for permitted signup transactions.
    The system must:
    • verify available balance
    • reserve/deduct through ledger
    • create signup transaction
    • establish sponsor
    • create new user
    • preserve audit history
    If signup fails, use a transaction rollback or compensating ledger entry.

---

72. WITHDRAWAL
    Members can request withdrawal of eligible:
    • SDP
    • SDC
    • SDP + SDC
    Pending/immature/restricted rewards cannot be withdrawn.
    Convert the requested amount into PKR using the applicable configured values.
    Snapshot the conversion values used.

---

73. WITHDRAWAL RESERVATION
    When a withdrawal request is created:
    the requested amount must become unavailable for:
    • spending
    • transfer
    • another withdrawal
    while the request is pending/processing.
    This must be represented through proper wallet/ledger state.
    Do not allow double spending.

---

74. WITHDRAWAL PAYOUT METHODS
    Current methods:
1. Bank Account
1. JazzCash
1. Easypaisa
   JazzCash requires:
   • number
   • name/account information
   Easypaisa requires:
   • number
   • name/account information
   Bank payout requires appropriate bank details.

---

75. PAYOUT DESTINATION SNAPSHOT
    When a withdrawal is submitted:
    snapshot the payout destination.
    Later profile changes must NOT rewrite the historical withdrawal destination.

---

76. CASH MANAGER WORKFLOW
    Current payout is manual.
    Flow:
    Withdrawal Request
    ↓
    Cash Manager Review
    ↓
    Cash Manager manually pays externally
    ↓
    Cash Manager enters TRX ID
    ↓
    Withdrawal marked PAID
    ↓
    Final ledger/payout record
    A withdrawal request does NOT mean payment has occurred.

---

77. PAID WITHDRAWAL CONSUMES THE SDC
    When a withdrawal containing SDC is marked:
    PAID
    the withdrawn SDC is permanently consumed.
    It:
    • does not return to the wallet
    • does not go into a Cash Manager wallet
    • cannot be spent again
    • cannot be transferred again
    • cannot be withdrawn again
    It becomes part of historical financial records only.

---

78. PAID WITHDRAWAL HISTORY
    The paid withdrawal record remains permanently available.
    Store:
    • withdrawal ID
    • user
    • SDP amount
    • SDC amount
    • PKR amount
    • conversion values
    • payout method
    • payout destination snapshot
    • processor/Cash Manager
    • timestamps
    • TRX ID
    • status
    • wallet ledger references
    The system must never delete a paid withdrawal.

---

79. TRX ID
    Cash Manager must enter the external transaction reference.
    TRX ID is permanently associated with the payout history.
    A PAID withdrawal must have the required transaction reference.
    Prevent duplicate payout.

---

80. FUTURE PAYOUT PROVIDERS
    Design a payout abstraction for future:
    • bank APIs
    • JazzCash APIs
    • Easypaisa APIs
    • other providers
    Current manual payout is one implementation.
    Do not rewrite the accounting system when automated payout is later introduced.

---

81. FINANCIAL IMMUTABILITY
    Never overwrite historical financial events.
    Do not modify historical:
    • rewards
    • reward rules
    • pool contributions
    • distributions
    • reversals
    • withdrawals
    • payouts
    • conversion values
    • platform fees
    • pool settlements
    • Admin SDC issuance
    • SDC transfers
    Use:
    • snapshots
    • reversal records
    • compensating records
    • immutable references

---

82. DATABASE DESIGN
    Use PostgreSQL + Drizzle.
    At minimum consider:
    • users
    • user_profiles
    • roles
    • permissions
    • user_roles
    • role_permissions
    • sponsor_relationships
    • genealogy
    • partner_applications
    • partner_agreements
    • categories
    • products
    • product_images
    • product_sdc_rules
    • product_sdp_rules
    • services
    • listings
    • inventory
    • orders
    • order_items
    • order_status_history
    • shipments
    • shipment_tracking
    • payments
    • payment_events
    • reward_rules
    • reward_rule_snapshots
    • sdp_rewards
    • sdc_rewards
    • sdc_tree_distributions
    • rank_qualification_ledger
    • wallets
    • wallet_ledger_entries
    • sdc_issuances
    • sdc_transfers
    • sdc_pools
    • sdc_pool_contributions
    • sdc_pool_snapshots
    • sdc_pool_rank_members
    • sdc_pool_rank_distributions
    • sdc_pool_member_distributions
    • rank_definitions
    • rank_requirements
    • member_rank_history
    • monthly_rank_evaluations
    • returns
    • return_items
    • reward_reversals
    • withdrawals
    • withdrawal_payout_snapshots
    • payout_transactions
    • platform_settings
    • audit_logs
    • notifications
    Refine normalization as needed, but preserve all underlying business concepts.

---

83. FINANCIAL TYPES
    Use PostgreSQL NUMERIC/DECIMAL.
    Do NOT use JavaScript floating-point numbers for authoritative financial calculations.
    Define appropriate precision/scale.
    Snapshot conversion values where necessary.

---

84. DATABASE CONSTRAINTS
    Protect against:
    • duplicate rewards
    • duplicate pool distributions
    • duplicate withdrawals
    • duplicate payouts
    • negative unauthorized balances
    • self-sponsorship
    • genealogy cycles
    • duplicate pool membership
    • duplicate level distributions
    • duplicate order-item rewards
    • invalid state transitions
    • duplicate transfer
    Use:
    • unique constraints
    • foreign keys
    • check constraints
    • database transactions

---

85. IDEMPOTENCY
    Financial operations must be idempotent.
    Examples:
    Repeated payment confirmation:
    → no duplicate rewards.
    Repeated return event:
    → no duplicate reversal.
    Repeated payout processing:
    → no duplicate payout.
    Repeated pool settlement:
    → no duplicate distribution.
    Repeated SDC transfer:
    → no duplicate transfer.
    Use idempotency keys and database constraints.

---

86. AUDIT LOG
    Create an immutable audit system.
    Record sensitive actions including:
    • role changes
    • permission changes
    • SDC issuance
    • SDC transfers
    • reward configuration
    • SDC value changes
    • SDP value changes
    • Partner agreement changes
    • platform fee changes
    • payment confirmation
    • reward generation
    • reward reversal
    • pool creation
    • pool settlement
    • rank evaluation
    • rank changes
    • withdrawal processing
    • payout/TRX entry
    • product approval
    • Partner approval
    Record:
    • actor
    • action
    • entity
    • entity ID
    • timestamp
    • metadata
    • before/after where appropriate

---

87. ADMIN SDC MANAGEMENT
    Admin dashboard must include controlled SDC issuance.
    Authorized users can:
    • search user
    • select recipient
    • enter SDC amount
    • record cash/payment received
    • record applicable PKR value
    • enter reason
    • enter reference/note
    • confirm issuance
    • review issuance history
    The issuance action must:
1. Verify permission.
1. Confirm payment.
1. Create issuance record.
1. Create SDC wallet credit ledger entry.
1. Do NOT create rank qualification.
1. Record audit event.
   Never directly edit wallet balances.

---

88. MEMBER SDC TRANSFER UI
    If enabled by Admin:
    Members may access:
    Send SDC
    Collect:
    • recipient
    • amount
    • optional reference/note
    Before execution:
    • verify sender balance
    • verify recipient
    • verify transfer permission
    • verify feature enabled
    • show confirmation
    On success:
    • sender debited
    • recipient credited
    • transfer recorded
    • no new SDC created
    • no new rank qualification created

---

89. ADMIN DASHBOARD
    Create a professional responsive Admin dashboard.
    Overview
    Show:
    • users
    • Patrons
    • Partners
    • orders
    • sales
    • approvals
    • rewards
    • pool status
    • withdrawals
    • pending payments
    • SDC issuance activity
    User Management
    • search
    • filters
    • profile
    • genealogy
    • sponsor
    • roles
    • permissions
    • Partner status
    • rank
    • wallet
    • financial history
    Product Management
    • products
    • categories
    • approvals
    • seller
    • inventory
    • reward rules
    Service Management
    • services
    • providers
    • approval
    • status
    MLM
    • genealogy
    • L1-L10
    • SDC rules
    • fallback recipient
    • reward history
    SDC Management
    • SDC issuance
    • SDC transfer history
    • wallet history
    • source history
    Pool Management
    • pools
    • contributions
    • maturity
    • snapshots
    • settlement
    • distributions
    Rank Management
    • ranks
    • requirements
    • evaluations
    • history
    Financial Management
    • SDP
    • SDC
    • wallets
    • withdrawals
    • payouts
    • TRX IDs
    • ledger
    Settings
    • conversion values
    • default sponsor
    • fallback recipient
    • Partner agreements
    • fees
    • reward rules
    • roles
    • permissions
    • member transfer setting

---

90. MEMBER DASHBOARD
    Modern responsive dashboard showing:
    • wallet summary
    • SDP
    • SDC
    • available
    • pending
    • matured
    • referrals
    • genealogy
    • earnings
    • orders
    • tracking
    • withdrawals
    • rank
    • rank progress
    • referral link
    • signup
    • Partner upgrade
    Partner users additionally see:
    • products
    • services
    • inventory
    • availability
    • Partner orders
    • sales
    • agreement

---

91. GENEALOGY UI
    Show:
    • sponsor
    • Level 1
    • Level 2
    • ...
    • Level 10
    Allow appropriate network inspection subject to permissions/privacy.
    Show relevant:
    • member
    • status
    • rank
    • sponsor
    • level
    Do not expose sensitive personal information unnecessarily.

---

92. WALLET UI
    Separate pages:
    SDP Wallet
    Show:
    • balance
    • earned
    • pending
    • spent
    • withdrawn
    • reversed
    • ledger
    SDC Wallet
    Show:
    • available
    • earned
    • waiting
    • matured
    • spent
    • transferred
    • withdrawn
    • reversed
    • tree rewards
    • pool rewards
    • Admin-issued SDC
    • ledger
    Clearly distinguish:
    Current Wallet Balance
    from:
    Historical Rank-Qualifying SDC

---

93. RANK PROGRESS UI
    Show the member:
    • current rank
    • evaluation period
    • qualifying SDP
    • qualifying historical SDC
    • requirements
    • progress
    • qualification status
    • rank history
    Do NOT show current wallet balance as the rank SDC metric.
    Do NOT imply that qualifying SDC is locked.

---

94. WITHDRAWAL UI
    Member chooses:
    • SDP
    • SDC
    • both
    System calculates PKR amount.
    Member chooses:
    • Bank
    • JazzCash
    • Easypaisa
    Display:
    • requested amounts
    • conversion values
    • PKR amount
    • payout method
    • destination
    • status

---

95. RETURN UI
    For each order item display:
    • shipping date
    • return deadline
    • days remaining
    • eligibility
    • quantity
    • return request
    • status
    Deadline is calculated from shipping date.

---

96. REWARD HISTORY UI
    Show:
    • reward type
    • source
    • order
    • product
    • amount
    • status
    • date
    • maturity
    • reversal
    • MLM level where applicable
    Admin sees deeper provenance and accounting lineage.

---

97. POOL ADMIN UI
    Show:
    • pool status
    • dates
    • total contribution
    • waiting SDC
    • matured SDC
    • reversed SDC
    • distributable SDC
    • participating ranks
    • captured members
    • rank shares
    • member shares
    • undistributed amount
    • settlement state
    Provide a settlement preview.
    Settlement must be transaction-safe.

---

98. POOL SETTLEMENT
    Settlement must:
1. Lock the pool.
1. Verify end date.
1. Reject new contributions.
1. Verify maturity/resolution.
1. Load immutable rank/member snapshot.
1. Calculate distributable SDC.
1. Divide equally among participating ranks.
1. Divide rank share equally among captured members.
1. Send undistributed amounts to configured recipient.
1. Create immutable distribution records.
1. Create wallet ledger entries.
1. Mark pool SETTLED.
1. Prevent duplicate settlement.
   Use a database transaction.
   Pool distributions do not create Rank Qualification Ledger entries.

---

99. RANK EVALUATION ENGINE
    Dedicated service must:
1. determine evaluation period
1. calculate eligible SDP
1. calculate historical qualifying SDC
1. exclude Admin-issued SDC
1. exclude pool-distributed SDC
1. exclude member-transfer amounts as new qualification
1. evaluate configured requirements
1. calculate highest qualified rank
1. allow multiple-rank promotion
1. limit demotion to one rank
1. create immutable rank history
1. remain idempotent

---

100. CRON / SCHEDULED JOBS
     Provide scheduled processing for:
     • SDC maturity
     • return-window resolution
     • monthly rank evaluation
     • pool lifecycle
     • notifications
     • other required background processing
     All jobs must be idempotent.

---

101. SECURITY
     Implement:
     • secure authentication
     • secure password hashing where applicable
     • server-side authorization
     • rate limiting
     • input validation
     • output encoding
     • secure file upload
     • webhook verification
     • session security
     • privilege escalation prevention
     • IDOR prevention
     • audit logging
     Never expose secrets to client components.
     Never rely on client-side authorization.

---

102. FILE UPLOADS
     Use UploadThing where appropriate.
     Validate:
     • file type
     • size
     • ownership
     • authorization
     Prevent cross-user file modification/deletion.

---

103. EMAIL
     Use Resend/React Email where appropriate.
     Templates may include:
     • registration
     • verification
     • Partner application
     • Partner approval
     • Partner rejection
     • payment confirmation
     • order
     • shipping
     • return
     • reward
     • withdrawal
     • payout
     • pool settlement
     • rank change
     Email failure must not corrupt financial transactions.

---

104. INTERNATIONALIZATION
     Use next-intl.
     Keep UI strings translation-ready.
     Do not hard-code all interface text inside components.

---

105. RESPONSIVE DESIGN
     Application must work well on:
     • desktop
     • tablet
     • mobile
     Member, Partner, marketplace, tracking, and Admin interfaces must all be responsive.

---

106. UX
     Provide:
     • loading states
     • skeletons
     • empty states
     • success states
     • error states
     • confirmation dialogs
     • pagination
     • search
     • filtering
     • sorting
     • status badges
     • transaction references
     • timestamps
     • clear financial labels
     Financial data must be visually unambiguous.

---

107. SEO
     SEO for public:
     • homepage
     • product pages
     • service pages
     • categories
     • marketplace pages
     • order tracking page where appropriate
     Private dashboards must be noindex.
     Implement:
     • metadata
     • canonical URLs
     • structured data where applicable
     • sitemap
     • robots

---

108. SERVER / DOMAIN ARCHITECTURE
     Organize backend logic into domains:
     • auth
     • users
     • genealogy
     • products
     • services
     • orders
     • payments
     • rewards
     • sdp
     • sdc
     • wallets
     • pools
     • ranks
     • withdrawals
     • partners
     • tracking
     • notifications
     • audit
     Do not place financial business logic in React components.

---

109. REWARD ENGINE
     Create a dedicated reward engine.
     Responsibilities:
     • validate qualifying sale
     • snapshot rules
     • calculate SDP
     • calculate SDC
     • resolve L1-L10
     • apply fixed SDC amounts
     • apply product overrides
     • apply system defaults
     • apply fallback recipient
     • create reward records
     • create wallet ledger entries
     • create rank qualification records where applicable
     • create pool contributions where applicable
     • remain idempotent

---

110. RANK QUALIFICATION ENGINE
     Create a separate Rank Qualification service.
     Its responsibility is NOT to manage the SDC wallet.
     It records qualifying business activity independently.
     When qualifying SDC is generated:
     Qualifying Event
     → SDC Wallet Credit
     → Rank Qualification Record
     Later:
     Spend / Transfer / Withdrawal
     must NOT remove the historical qualification record.

---

111. SDC ISSUANCE ENGINE
     Create a dedicated Admin SDC issuance service.
     Input:
     • recipient
     • SDC amount
     • payment amount
     • conversion value
     • reference
     • reason
     Process:
1. authorization
1. payment confirmation
1. issuance creation
1. wallet credit
1. audit log
   Do NOT create rank qualification.
   Do NOT create pool contribution unless another explicit qualifying business rule says so.

---

112. SDC TRANSFER ENGINE
     Create a dedicated transfer service.
     Process:
1. verify feature enabled
1. verify authorization
1. verify sender
1. verify recipient
1. verify available balance
1. prevent self-transfer
1. create sender debit
1. create recipient credit
1. create transfer record
1. commit atomically
   Do NOT create new SDC.
   Do NOT create rank qualification.

---

113. RETURN / REVERSAL ENGINE
     Input:
     • return
     • return item
     • quantity
     Identify all financial effects of affected item/quantity.
     Reverse:
     • SDP
     • SDC
     • tree distributions
     • pool contributions
     Create linked reversal/compensating records.
     Never delete original financial records.
     If an amount has already been distributed/spent/withdrawn, use the appropriate compensating ledger/reversal process and preserve complete history.
     Do not invent an unrecoverable negative-balance policy unless explicitly defined.

---

114. IMPORTANT ACCOUNTING MODEL
     The system must distinguish:
     SDC Creation
     Examples:
     • qualifying business-generated SDC
     • authorized Admin cash-based SDC issuance
     • other explicitly authorized creation events
     SDC Movement
     Examples:
     • member-to-member transfer
     • purchase/spending
     • withdrawal
     • pool distribution
     • reversal/compensation
     A transfer does not create new SDC.
     A withdrawal consumes the user's SDC after successful payout.
     All movements must remain traceable.

---

115. COMPLETE SDC TRACEABILITY
     For every SDC amount, the system must be able to trace:
     Creation
     → source
     → wallet
     → qualification status where applicable
     → tree/pool effect where applicable
     → maturity
     → spend/transfer/withdrawal/distribution
     → reversal if applicable
     The database must preserve these relationships.

---

116. EXAMPLE BUSINESS TRACE
     Example:
     Order #1001
     ↓
     Order Item #1001-2
     ↓
     Payment #5001
     ↓
     Payment Confirmed
     ↓
     SDP Reward #7001
     ↓
     SDC Reward #7002
     ↓
     L1 Distribution
     ↓
     L2 Distribution
     ↓
     ...
     ↓
     L10 Distribution
     ↓
     Pool Contribution
     ↓
     Waiting period
     ↓
     Matured
     ↓
     Pool
     ↓
     Rank snapshot
     ↓
     Pool distribution
     Each stage must have explicit references.

---

117. EXAMPLE RANK-QUALIFICATION TRACE
     Member purchases qualifying product.
     Generated SDC:
     500
     System records:
     SDC Wallet +500
     and:
     Rank Qualification +500
     Member later:
     • spends 200
     • transfers 100
     • withdraws 100
     Wallet decreases accordingly.
     Historical rank qualification remains:
     500
     The rank qualification is not a wallet restriction.

---

118. EXAMPLE ADMIN SDC ISSUANCE
     Member needs:
     5,000 SDC
     for a permitted signup/purchase.
     Member pays Admin the required cash.
     Admin confirms receipt.
     Admin issues:
     5,000 SDC
     System records:
     SDC Wallet +5,000
     and:
     Rank Qualification +0
     The member may immediately use the eligible SDC according to normal wallet rules.

---

119. EXAMPLE MEMBER TRANSFER
     User A has:
     10,000 SDC
     User A sends:
     3,000 SDC
     to User B.
     System records:
     User A:
     -3,000
     User B:
     +3,000
     No new SDC is created.
     No new rank qualification is created.
     User A's previous rank qualification remains unchanged.
     User B's rank qualification remains unchanged by the transfer.

---

120. EXAMPLE WITHDRAWAL
     User has:
     1,000 SDC
     User requests:
     600 SDC
     withdrawal.
     The 600 becomes unavailable while withdrawal is pending/processing.
     Cash Manager pays externally.
     Cash Manager enters TRX ID.
     Cash Manager marks:
     PAID
     The 600 SDC is permanently consumed.
     Historical withdrawal remains permanently stored.
     The user's historical Rank Qualification is unaffected.

---

121. DO NOT INVENT BUSINESS RULES
     Do NOT invent:
     • SDC percentages
     • SDP percentages
     • rank thresholds
     • rank requirements
     • pool percentages
     • alternative maturity periods
     • universal Partner fees
     • automatic payouts
     • automatic payment confirmation
     • taxes
     • commissions
     • transfer fees
     • transfer limits
     • qualification rules not supplied
     • financial recovery rules not supplied
     When a business value is unspecified:
     • make it configurable where appropriate, or
     • clearly identify it as requiring a future business decision.
     Do not silently invent financial behavior.

---

122. CURRENT PAYMENT REALITY
     Current payment confirmation is manual.
     Do not claim that Stripe, PayPal, JazzCash, Easypaisa, or banks currently process payments automatically.
     Build provider abstractions for future automation.

---

123. CURRENT PAYOUT REALITY
     Current payouts are manual.
     Cash Manager:
1. reviews withdrawal
1. pays externally
1. enters TRX ID
1. marks PAID
   Do not claim automatic bank/JazzCash/Easypaisa payouts currently exist.

---

124. TESTING
     Create comprehensive automated tests.
     Authentication
     • registration
     • login
     • authorization
     • privilege escalation prevention
     Genealogy
     • sponsor
     • default sponsor
     • ten levels
     • missing upline
     • cycle prevention
     SDP
     • generation
     • payment confirmation dependency
     • wallet
     • reversal
     SDC
     • fixed amounts
     • L1-L10
     • product override
     • fallback recipient
     • maturity
     • reversal
     • provenance
     Rank qualification
     • qualifying SDC
     • repeated qualifying events
     • aggregation
     • spending does not reduce qualification
     • withdrawal does not reduce qualification
     • transfer does not create qualification
     • Admin issuance does not create qualification
     • pool distribution does not create qualification
     Admin issuance
     • authorization
     • payment confirmation
     • wallet credit
     • audit
     • no rank qualification
     Member transfer
     • feature disabled
     • feature enabled
     • sufficient balance
     • insufficient balance
     • self-transfer
     • duplicate transfer
     • atomic debit/credit
     • no rank qualification
     Orders
     • multi-item
     • item rewards
     • shipping
     • tracking
     • status history
     Returns
     • Day 1
     • Day 10
     • Day 11
     • partial return
     • reward reversal
     Pools
     • active
     • end date
     • ended waiting
     • maturity
     • snapshot
     • equal rank distribution
     • equal member distribution
     • undistributed recipient
     • duplicate settlement prevention
     • no rank qualification from pool distribution
     Ranks
     • monthly evaluation
     • multiple promotion
     • one-rank demotion
     • historical qualifying SDC
     Wallet
     • earning
     • spending
     • transfer
     • Admin issuance
     • withdrawal
     • reversal
     • negative balance prevention
     Withdrawal
     • reservation
     • payout snapshot
     • manual payout
     • TRX ID
     • PAID
     • duplicate payout prevention
     • permanent consumption
     Partner
     • application
     • approval
     • listing
     • fee
     • seller settlement
     Payment
     • manual confirmation
     • idempotency
     • future provider abstraction

---

125. SEED DATA
     Create safe development seed data including:
     • Owner
     • Product Manager
     • Cash Manager
     • Partner Manager
     • SD Patron Manager
     • Patrons
     • Partners
     • 10+ genealogy levels
     • sample products
     • sample services
     • sample ranks
     • SDC configuration
     • sample pool
     • sample orders
     • rewards
     • sample withdrawals
     • sample SDC issuance
     • sample transfer history
     Clearly mark all credentials as development-only.
     Never use production secrets.

---

126. ENVIRONMENT VARIABLES
     Create .env.example.
     Include placeholders for:
     • DATABASE_URL
     • AUTH_SECRET
     • required Auth.js configuration
     • Stripe
     • PayPal
     • UploadThing
     • Resend
     • email
     • future payout providers
     Never commit real secrets.

---

127. DATABASE MIGRATIONS
     Use Drizzle migrations.
     Provide:
     • schema
     • migration workflow
     • seed workflow
     • development setup
     Historical financial data must be preserved.
     Avoid destructive migrations involving financial history unless explicitly approved.

---

128. ERROR HANDLING
     Create domain-specific errors such as:
     • insufficient balance
     • invalid sponsor
     • invalid genealogy
     • payment not confirmed
     • reward already generated
     • return window expired
     • pool ended
     • pool not mature
     • duplicate settlement
     • unauthorized payout
     • Partner not approved
     • unauthorized SDC issuance
     • transfer disabled
     • invalid transfer
     • duplicate transfer
     Return safe user-facing messages.
     Do not expose internal implementation details.

---

129. OBSERVABILITY
     Implement useful server-side logging.
     Financial operations should have identifiable references.
     Log events such as:
     • payment confirmation
     • reward generation
     • reward reversal
     • SDC issuance
     • SDC transfer
     • pool settlement
     • rank evaluation
     • withdrawal processing
     • payout
     Never log:
     • passwords
     • API secrets
     • authentication secrets
     • sensitive credentials

---

130. PROJECT STRUCTURE
     Use a scalable domain-oriented structure.
     Conceptually:
     app/
     (public)/
     (auth)/
     dashboard/
     admin/
     api/

components/
ui/
dashboard/
admin/
marketplace/
tracking/

lib/
auth/
db/
domain/
users/
genealogy/
products/
services/
orders/
payments/
rewards/
sdp/
sdc/
wallets/
pools/
ranks/
withdrawals/
partners/
tracking/
validations/
permissions/
audit/
utils/

drizzle/
tests/
Refine as necessary while maintaining separation of concerns.

---

131. IMPLEMENTATION PHASES
     Phase 1 — Foundation
     • Next.js
     • TypeScript
     • Tailwind
     • database
     • Drizzle
     • authentication
     • RBAC
     Phase 2 — Users
     • registration
     • sponsor
     • default sponsor
     • dashboard
     • genealogy
     Phase 3 — E-commerce
     • categories
     • products
     • services
     • cart
     • orders
     • order items
     • payments
     Phase 4 — Partner
     • Partner application
     • approval
     • unified dashboard
     • products
     • services
     • inventory
     • Partner orders
     • Partner agreement/fee
     Phase 5 — Rewards
     • SDP
     • SDC
     • L1-L10
     • fallback
     • snapshots
     • wallet ledger
     • Rank Qualification Ledger
     Phase 6 — Maturity/Returns
     • shipping date
     • 10-day rule
     • returns
     • reversals
     • maturity
     Phase 7 — Pools
     • pools
     • contributions
     • snapshots
     • maturity
     • settlement
     • distribution
     Phase 8 — Ranks
     • definitions
     • requirements
     • monthly evaluation
     • promotion
     • demotion
     • history
     Phase 9 — Wallet
     • SDP
     • SDC
     • spending
     • marketplace settlement
     • signup
     • Admin SDC issuance
     • member transfer
     Phase 10 — Withdrawals
     • PKR conversion
     • Bank
     • JazzCash
     • Easypaisa
     • reservation
     • payout snapshot
     • Cash Manager
     • TRX ID
     • permanent consumption
     Phase 11 — Tracking
     • public order tracking
     • shipment tracking
     • status timeline
     • Partner fulfillment
     • return tracking
     Phase 12 — Admin
     • configuration
     • financial reports
     • audit
     • approvals
     • pool management
     • SDC issuance management
     • transfer management
     Phase 13 — Testing/Security/Performance
     • automated tests
     • security review
     • performance
     • idempotency
     • deployment readiness

---

132. ACCEPTANCE CRITERIA
     The project is complete only when:
1. Users can register.
1. Missing referral uses configured default sponsor.
1. Genealogy supports exactly 10 identifiable levels.
1. Patron and Partner use one account.
1. Partner capabilities unlock after approval.
1. Partners can manage products/services.
1. Admin can manage listings.
1. Orders support multiple items.
1. Payment confirmation is required before applicable rewards.
1. SDP is generated according to configured rules.
1. SDC is distributed through applicable L1-L10 rules.
1. Each level has independent fixed SDC configuration.
1. Product SDC rules override defaults.
1. Missing upline SDC goes to configured fallback recipient.
1. SDC pool contributions are separately traceable.
1. SDC has waiting/matured states.
1. Pool stops accepting new contributions after its end date.
1. Pool uses immutable rank/member snapshots.
1. Pool distributes equally among participating ranks.
1. Pool distributes equally among captured eligible members.
1. Undistributed pool amounts go to configured recipient.
1. Pool-distributed SDC does not count for rank.
1. Rank evaluation is monthly.
1. Multiple-rank promotion works.
1. Demotion is limited to one rank.
1. Return period uses shipping date.
1. Day 10 is final return day.
1. Day 11 is outside the return period.
1. Returns work at order-item level.
1. Affected SDP/SDC is reversed.
1. Original financial records remain immutable.
1. Reversals reference originals.
1. SDC provenance is complete.
1. SDP and SDC have separate wallets.
1. Admin can configure current SDP/SDC PKR values.
1. Eligible SDP/SDC can be withdrawn.
1. Withdrawals convert to PKR.
1. Payout details are snapshotted.
1. Cash Manager can manually process payouts.
1. TRX ID is recorded.
1. Paid withdrawals permanently consume withdrawn SDC/SDP.
1. Paid withdrawal history remains permanently available.
1. Partner fees follow Partner-specific Admin agreements.
1. Partner fee is represented in SDC.
1. Admin can issue SDC against confirmed cash/payment.
1. Admin-issued SDC enters the normal SDC wallet.
1. Admin-issued SDC does not count toward rank.
1. Member-to-member SDC transfer can be enabled/disabled.
1. Member transfer moves existing SDC only.
1. Member transfer creates no new rank qualification.
1. Historical qualifying SDC remains valid after spending.
1. Historical qualifying SDC remains valid after withdrawal.
1. Current wallet balance is NOT used as the rank metric.
1. Rank Qualification Ledger is separate from the wallet.
1. Order tracking works by Order Number with proper security.
1. Customers can view order status timelines.
1. Shipping/tracking information is preserved.
1. Financial operations are auditable.
1. Duplicate reward/transfer/payout/settlement operations are prevented.
1. Automated tests cover critical financial and MLM flows.
1. No financial business rule exists only in frontend code.
1. No unspecified financial rule is invented.

---

133. FINAL DEVELOPMENT INSTRUCTION
     Build StakeDeals as a serious production-grade:
     • e-commerce platform
     • marketplace
     • MLM system
     • reward platform
     • wallet system
     • financial ledger
     • order-tracking platform
     Prioritize:
1. accounting correctness
1. immutable history
1. transaction safety
1. genealogy correctness
1. reward correctness
1. rank qualification correctness
1. pool settlement correctness
1. authorization/security
1. marketplace correctness
1. order/return correctness
1. auditability
1. maintainability
   The most important accounting principle is:
   SDC Wallet = current usable SDC.
   Rank Qualification Ledger = historical qualifying business activity.
   Qualifying business-generated SDC can count toward rank when generated, but the resulting SDC remains freely usable.
   Spending, transferring, or withdrawing that SDC does not erase the historical rank qualification.
   Admin-issued SDC against confirmed cash/payment is normal usable SDC but does not qualify the member for rank.
   Pool-distributed SDC is normal usable SDC but does not qualify the member for rank.
   Member-to-member transfer moves existing SDC and does not create new SDC or new rank qualification.
   A successful withdrawal permanently consumes the withdrawn SDC/SDP, while the complete withdrawal and payout history remains permanently auditable.
   The database ledger and immutable historical records are the source of truth for financial/reward history.
   Displayed balances must be derived from or transactionally synchronized with the ledger.
   Every important financial action must be traceable from source to final disposition.
   When requirements are unspecified, do not silently invent financial rules.
   Where appropriate, make them Admin-configurable or clearly isolate them as future business decisions.
   The final system must be capable of explaining every SDP and SDC movement from its original source through its current state or final disposition.
   Super Admin Reward Overview
   Add a simple Reward Overview feature for the Super Admin so they can understand the current SDP/SDC position at a glance.
   This feature should contain only:
   Current Rewards
   • SDP Currently With Users
   • SDC Currently With Users
   • Pending Rewards
   Needs Attention
   • Pending Withdrawals
   • Pending Payment Confirmations
   • Pending Partner Applications
   Today
   • Rewards Generated Today
   • Withdrawals Paid Today
   Last 7 Days
   • SDP Generated
   • SDC Generated
   • Withdrawals Paid
   Also show a small last updated timestamp so the Super Admin knows when the displayed figures were refreshed.
   Keep this reward overview compact and easy to understand. Do not make this feature bulky or turn it into a detailed accounting/reporting interface.
   A 30-day view does not need to be shown in this quick-glance feature and should remain available through the appropriate reporting area if needed.

PUBLIC WEBSITE, PAGES & CONTENT MANAGEMENT
StakeDeals must have a complete, modern, professional public-facing website. The public website must not feel like an unfinished application or a collection of placeholder pages.
Public Pages
Include appropriate production-ready public pages such as:
• Home
• About Us
• Contact Us
• Terms & Conditions
• Privacy Policy
• Returns & Refund Policy
• Shipping & Delivery Policy
• FAQ
• How StakeDeals Works
• SD Patron information
• SD Partner information
• Rewards / SDP / SDC information
• Marketplace / Products
• Services
• Track Order
• Login
• Registration
• Other appropriate public informational pages required by the platform
The exact page structure, navigation hierarchy, and visual presentation should be determined by the implementation based on modern e-commerce, marketplace, and membership-platform UX standards.
Admin-Managed Public Pages
Authorized Admin users must be able to manage public website content without changing application source code.
The system should support:
• Create pages
• Edit pages
• Publish/unpublish pages
• Draft pages
• Delete pages where appropriate
• Page title
• URL slug
• Page content
• Featured image/media where appropriate
• SEO title
• SEO description
• Social sharing metadata where appropriate
• Navigation visibility
• Footer visibility
• Display/order position
• Created/updated timestamps
• Author/editor information
• Audit history
Provide sensible default/sample pages so the website is complete immediately after installation. Sample content must be clearly editable and must not be presented as final legal advice or permanent business policy.
Modern Header & Footer
The public website must have a polished, modern, responsive global header and footer appropriate for a professional e-commerce, marketplace, rewards, and membership platform.
The implementation should determine the most appropriate header and footer structure and include the elements users would reasonably expect from a complete modern website, such as:
• Brand/logo
• Main navigation
• Relevant marketplace/product/service navigation
• Search where appropriate
• Authentication actions
• Contact information where appropriate
• Responsive mobile navigation
• Useful footer navigation
• Legal/policy links
• Contact/reach-us information
• Social-media links/icons
• Appropriate business and platform information
• Copyright and other standard footer information
Do not hard-code unnecessary contact or social-media information. Global contact details, social links, branding information, and other appropriate site-wide settings should be configurable by authorized Admin users.
The header and footer must be reusable across the public website, responsive across desktop/tablet/mobile, visually consistent, accessible, and integrated with the site's overall design system.
General Public Website Standard
The public website should be designed as a complete modern production website rather than simply satisfying a list of individual pages.
The implementation team/AI agent may determine appropriate sections, components, navigation patterns, icons, spacing, responsive behavior, and supporting UX elements based on established modern web design practices, while remaining consistent with StakeDeals branding and the functional requirements in this specification.
Do not add unnecessary complexity merely for visual effect. Prioritize clarity, usability, performance, accessibility, responsiveness, SEO, and a cohesive professional experience.

# Design Document

## Overview

The Alpacabon's Hardwarezone POS System is a full-stack Laravel application using Jetstream for authentication, Livewire for reactive components, and Tailwind CSS for a minimalist responsive UI. The system will be created in a separate `pos-hardwarezone` folder, completely independent from the existing backend project.

The architecture prioritizes:
- Fast sidebar rendering via JSON-stored menu permissions (no additional queries)
- Normalized database with proper foreign key relationships
- Dynamic store settings for easy business info updates
- Clean separation between admin and user functionalities

## Architecture

```
pos-hardwarezone/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Livewire/           # Livewire components
│   │   └── Middleware/
│   ├── Models/
│   ├── Services/               # Business logic
│   └── Enums/                  # Role enums
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── views/
│   │   ├── components/         # Blade components
│   │   ├── layouts/
│   │   ├── livewire/
│   │   └── pages/
│   └── css/
├── routes/
└── config/
```

### Technology Stack

- **Backend**: Laravel 11 with Jetstream (Livewire stack)
- **Frontend**: Blade templates + Livewire + Alpine.js + Tailwind CSS
- **Database**: MySQL/SQLite (configurable)
- **Authentication**: Laravel Jetstream with Fortify

## Components and Interfaces

### 1. Authentication & Authorization

```php
// app/Enums/UserRole.php
enum UserRole: string {
    case ADMIN = 'admin';
    case USER = 'user';
}

// Menu permissions stored as JSON on User model
// Example: ["dashboard", "pos", "products", "inventory", "transactions", "reports", "users", "settings"]
```

### 2. Sidebar Menu System

Predefined menu items (hardcoded for performance):

```php
// config/menu.php
return [
    'items' => [
        'dashboard' => ['label' => 'Dashboard', 'icon' => 'home', 'route' => 'dashboard'],
        'pos' => ['label' => 'POS Terminal', 'icon' => 'shopping-cart', 'route' => 'pos'],
        'products' => ['label' => 'Products', 'icon' => 'box', 'route' => 'products.index'],
        'inventory' => ['label' => 'Inventory', 'icon' => 'clipboard-list', 'route' => 'inventory.index'],
        'transactions' => ['label' => 'Transactions', 'icon' => 'receipt', 'route' => 'transactions.index'],
        'reports' => ['label' => 'Reports', 'icon' => 'chart-bar', 'route' => 'reports.index'],
        'users' => ['label' => 'Users', 'icon' => 'users', 'route' => 'users.index', 'admin_only' => true],
        'settings' => ['label' => 'Settings', 'icon' => 'cog', 'route' => 'settings.index', 'admin_only' => true],
    ]
];
```

### 3. Core Livewire Components

| Component | Purpose |
|-----------|---------|
| `PosTerminal` | Main sales interface with product search and cart |
| `ProductTable` | Paginated product listing with search |
| `InventoryManager` | Stock adjustment interface |
| `TransactionHistory` | Transaction listing with filters |
| `UserPermissions` | Admin interface for managing user menu access |
| `StoreSettings` | Dynamic store information editor |
| `SalesReport` | Report generation with date filters |

### 4. Service Classes

```php
// app/Services/CartService.php - Cart management
// app/Services/TransactionService.php - Transaction processing
// app/Services/InventoryService.php - Stock management
// app/Services/SettingsService.php - Store settings retrieval/caching
```

## Data Models

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ transactions : creates
    users {
        bigint id PK
        string name
        string email
        string password
        enum role "admin|user"
        json menu_permissions
        timestamps
    }
    
    categories ||--o{ products : contains
    categories {
        bigint id PK
        string name
        string description
        timestamps
    }
    
    products ||--o{ transaction_items : sold_in
    products ||--o{ stock_adjustments : tracked_by
    products {
        bigint id PK
        bigint category_id FK
        string name
        string sku
        text description
        decimal price
        int stock_quantity
        boolean is_active
        timestamps
    }
    
    transactions ||--o{ transaction_items : contains
    transactions {
        bigint id PK
        bigint user_id FK
        string transaction_number
        decimal subtotal
        decimal tax
        decimal discount
        decimal total
        enum payment_method
        timestamps
    }
    
    transaction_items {
        bigint id PK
        bigint transaction_id FK
        bigint product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
        timestamps
    }
    
    stock_adjustments {
        bigint id PK
        bigint product_id FK
        bigint user_id FK
        int quantity_change
        string reason
        timestamps
    }
    
    settings {
        bigint id PK
        string key UK
        text value
        timestamps
    }
```

### Key Settings (settings table)

| Key | Example Value |
|-----|---------------|
| `store_name` | Alpacabon's Hardwarezone |
| `store_address` | 7A Casino St. PAB Tagoloan, Mis. Or. |
| `store_contact` | 0965-2618254 |
| `store_email` | alpacabons@example.com |
| `tax_rate` | 12 |
| `receipt_footer` | Thank you for shopping! |



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Settings Round-Trip Consistency
*For any* store setting key-value pair, saving it to the database and then retrieving it should return the same value, and any page displaying that setting should show the stored value.
**Validates: Requirements 1.2, 1.3**

### Property 2: User Role Assignment Validity
*For any* newly created user, the user record must have a role that is either 'admin' or 'user' - no null or invalid roles allowed.
**Validates: Requirements 2.1**

### Property 3: User Permission Persistence
*For any* user whose role or menu permissions are updated by an admin, the changes must be persisted to the database and reflected in the user's menu_permissions JSON field.
**Validates: Requirements 2.3, 3.2**

### Property 4: Authenticated User Session Contains Permissions
*For any* authenticated user, their session/auth context must contain their role and menu_permissions, loaded from the database without additional queries after initial authentication.
**Validates: Requirements 2.4**

### Property 5: Sidebar Renders Only Permitted Items
*For any* user with a specific set of menu_permissions, the rendered sidebar must contain exactly those menu items and no others (except items visible to all).
**Validates: Requirements 3.3**

### Property 6: Cart Total Accuracy
*For any* cart with products, the cart total must equal the sum of (unit_price × quantity) for all items in the cart.
**Validates: Requirements 4.2**

### Property 7: Transaction Record Completeness
*For any* completed transaction, the database must contain a transaction record with all line items matching the cart contents at checkout time.
**Validates: Requirements 4.3**

### Property 8: Inventory Decrement on Sale
*For any* completed transaction, each product's stock_quantity must be decremented by exactly the quantity sold in that transaction.
**Validates: Requirements 4.4**

### Property 9: Receipt Contains Required Information
*For any* generated receipt, it must contain the current store name, address, contact, transaction number, all line items, and total amount.
**Validates: Requirements 4.5**

### Property 10: Product Validation Enforcement
*For any* product creation attempt, the system must reject submissions missing name, price, or initial stock quantity.
**Validates: Requirements 5.2**

### Property 11: Stock Adjustment Logging
*For any* stock quantity change, a corresponding stock_adjustment record must be created with the correct quantity_change, user_id, and timestamp.
**Validates: Requirements 5.3**

### Property 12: Out of Stock Marking
*For any* product where stock_quantity equals zero, the product must be marked or treated as out of stock in the system.
**Validates: Requirements 5.4**

### Property 13: Product Search Accuracy
*For any* search query, all returned products must match the query against name, SKU, or category name.
**Validates: Requirements 5.5**

### Property 14: Report Date Range Filtering
*For any* date range filter applied to reports, all returned transactions must have created_at timestamps within the specified range, and totals must equal the sum of those transactions.
**Validates: Requirements 6.2, 6.3**

## Error Handling

| Scenario | Handling Strategy |
|----------|-------------------|
| Invalid login credentials | Display error message, log attempt, rate limit after 5 failures |
| Insufficient stock for sale | Prevent transaction, show warning with available quantity |
| Missing required product fields | Validation error with specific field messages |
| Database connection failure | Show maintenance page, log error, alert admin |
| Unauthorized menu access | Redirect to dashboard with "Access Denied" message |
| Invalid setting key | Return default value, log warning |
| Transaction processing failure | Rollback all changes, show error, preserve cart |
| Session timeout | Redirect to login, preserve intended destination |

## Testing Strategy

### Testing Framework
- **Unit Tests**: PHPUnit (Laravel's default)
- **Property-Based Tests**: [Eris](https://github.com/giorgiosironi/eris) - PHP property-based testing library
- **Feature Tests**: Laravel's built-in HTTP testing

### Unit Testing Approach
Unit tests will cover:
- Model relationships and accessors
- Service class methods
- Validation rules
- Helper functions

### Property-Based Testing Approach
Each correctness property will be implemented as a property-based test using Eris. Tests will:
- Generate random valid inputs using Eris generators
- Run minimum 100 iterations per property
- Tag each test with the property number and requirements reference

Example test annotation format:
```php
/**
 * Feature: pos-hardwarezone, Property 6: Cart Total Accuracy
 * Validates: Requirements 4.2
 */
public function testCartTotalAccuracy(): void
```

### Test Categories

| Category | Coverage |
|----------|----------|
| Authentication | Login, logout, role verification |
| Authorization | Menu permission checks, route guards |
| Settings | CRUD operations, caching |
| Products | CRUD, validation, search |
| Inventory | Stock adjustments, logging |
| Transactions | Cart operations, checkout, receipts |
| Reports | Date filtering, calculations |

### Test Data Strategy
- Use Laravel factories for generating test data
- Eris generators for property-based test inputs
- Database transactions for test isolation (rollback after each test)

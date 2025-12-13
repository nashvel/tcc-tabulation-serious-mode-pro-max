# Implementation Plan

> **Note:** This is a new standalone Laravel project to be created in the `pos-hardwarezone` folder, completely separate from the existing `backend` project.

- [ ] 1. Project Setup and Authentication
  - [x] 1.1 Create new Laravel project with Jetstream in `pos-hardwarezone` folder





    - Run `composer create-project laravel/laravel pos-hardwarezone`
    - Install Jetstream with Livewire: `composer require laravel/jetstream` then `php artisan jetstream:install livewire`
    - Configure database connection in `.env`
    - _Requirements: 2.1, 2.4_
  - [-] 1.2 Extend User model with role and menu_permissions



    - Add `role` enum column and `menu_permissions` JSON column to users table migration
    - Create `UserRole` enum in `app/Enums/UserRole.php`
    - Update User model with casts and accessors
    - _Requirements: 2.1, 3.4_
  - [ ] 1.3 Write property test for user role assignment validity


    - **Property 2: User Role Assignment Validity**
    - **Validates: Requirements 2.1**

- [ ] 2. Database Schema and Models

  - [x] 2.1 Create categories migration and model




    - Create migration with `id`, `name`, `description`, timestamps
    - Create Category model with products relationship
    - _Requirements: 8.1_
  - [x] 2.2 Create products migration and model





    - Create migration with `id`, `category_id` FK, `name`, `sku`, `description`, `price`, `stock_quantity`, `is_active`, timestamps
    - Create Product model with category and transactionItems relationships
    - _Requirements: 5.2, 8.1_
  - [x] 2.3 Create transactions and transaction_items migrations and models





    - Create transactions migration with `id`, `user_id` FK, `transaction_number`, `subtotal`, `tax`, `discount`, `total`, `payment_method`, timestamps
    - Create transaction_items migration with `id`, `transaction_id` FK, `product_id` FK, `quantity`, `unit_price`, `subtotal`, timestamps
    - Create Transaction and TransactionItem models with relationships
    - _Requirements: 4.3, 8.2_
  - [x] 2.4 Create stock_adjustments migration and model





    - Create migration with `id`, `product_id` FK, `user_id` FK, `quantity_change`, `reason`, timestamps
    - Create StockAdjustment model with relationships
    - _Requirements: 5.3_
  - [x] 2.5 Create settings migration and model





    - Create migration with `id`, `key` (unique), `value` (text), timestamps
    - Create Setting model with static helper methods
    - _Requirements: 1.1, 8.4_
  - [x] 2.6 Write property test for settings round-trip consistency






    - **Property 1: Settings Round-Trip Consistency**
    - **Validates: Requirements 1.2, 1.3**

- [x] 3. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.




- [x] 4. Menu Configuration and Sidebar


  - [x] 4.1 Create menu configuration file


    - Create `config/menu.php` with all menu items definition
    - Include keys: dashboard, pos, products, inventory, transactions, reports, users, settings
    - Mark admin-only items
    - _Requirements: 3.1_
  - [x] 4.2 Create Sidebar Blade component


    - Create `resources/views/components/sidebar.blade.php`
    - Filter menu items based on user's menu_permissions JSON
    - Implement responsive collapse for mobile
    - _Requirements: 3.3, 7.4_
  - [x] 4.3 Write property test for sidebar rendering






    - **Property 5: Sidebar Renders Only Permitted Items**
    - **Validates: Requirements 3.3**

- [x] 5. Settings Management





  - [x] 5.1 Create SettingsService class


    - Implement `get($key, $default)` and `set($key, $value)` methods
    - Add caching for frequently accessed settings
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 5.2 Create StoreSettings Livewire component

    - Create form for editing store_name, store_address, store_contact, store_email, tax_rate, receipt_footer
    - Implement save functionality with validation
    - _Requirements: 1.1, 1.2_

  - [x] 5.3 Create settings page view

    - Create `resources/views/livewire/store-settings.blade.php`
    - Style with Tailwind for minimalist design
    - _Requirements: 1.1, 7.3_

  - [x] 5.4 Seed default store settings

    - Create SettingsSeeder with Alpacabon's Hardwarezone defaults
    - Address: 7A Casino St. PAB Tagoloan, Mis. Or.
    - Contact: 0965-2618254
    - _Requirements: 1.4_

- [x] 6. User Management and Permissions



  - [x] 6.1 Create UserManagement Livewire component
    - List all users with roles and permissions
    - Implement create, edit, delete functionality
    - _Requirements: 2.2, 2.3_

  - [x] 6.2 Create UserPermissions Livewire component
    - Display checklist of all menu items from config
    - Toggle permissions and save to user's menu_permissions JSON
    - _Requirements: 3.1, 3.2_
  - [x] 6.3 Write property test for user permission persistence






    - **Property 3: User Permission Persistence**
    - **Validates: Requirements 2.3, 3.2**
  - [x] 6.4 Write property test for authenticated user session






    - **Property 4: Authenticated User Session Contains Permissions**
    - **Validates: Requirements 2.4**

- [x] 7. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Product Management






  - [x] 8.1 Create ProductTable Livewire component

    - Paginated product listing with search
    - Filter by name, SKU, category
    - _Requirements: 5.1, 5.5_

  - [x] 8.2 Create ProductForm Livewire component

    - Form for creating/editing products
    - Validate required fields: name, price, stock_quantity
    - _Requirements: 5.2_
  - [x] 8.3 Write property test for product validation






    - **Property 10: Product Validation Enforcement**
    - **Validates: Requirements 5.2**
  - [x] 8.4 Write property test for product search accuracy






    - **Property 13: Product Search Accuracy**
    - **Validates: Requirements 5.5**

- [x] 9. Inventory Management






  - [x] 9.1 Create InventoryService class

    - Implement `adjustStock($productId, $quantity, $reason, $userId)` method
    - Create stock adjustment record
    - Update product stock_quantity
    - _Requirements: 5.3, 5.4_

  - [x] 9.2 Create InventoryManager Livewire component

    - Display products with current stock levels
    - Form for stock adjustments with reason
    - _Requirements: 5.3_
  - [x] 9.3 Write property test for stock adjustment logging






    - **Property 11: Stock Adjustment Logging**
    - **Validates: Requirements 5.3**
  - [x] 9.4 Write property test for out of stock marking






    - **Property 12: Out of Stock Marking**
    - **Validates: Requirements 5.4**

- [x] 10. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. POS Terminal and Cart






  - [x] 11.1 Create CartService class

    - Implement cart operations: add, remove, update quantity, clear
    - Calculate totals with tax
    - Store cart in session
    - _Requirements: 4.2_

  - [x] 11.2 Create PosTerminal Livewire component

    - Product search interface
    - Cart display with item management
    - Checkout button
    - _Requirements: 4.1, 4.2_
  - [x] 11.3 Write property test for cart total accuracy






    - **Property 6: Cart Total Accuracy**
    - **Validates: Requirements 4.2**

- [x] 12. Transaction Processing

  - [x] 12.1 Create TransactionService class
    - Implement `processTransaction($cart, $paymentMethod)` method
    - Create transaction and transaction_items records
    - Decrement product inventory
    - Generate transaction number
    - _Requirements: 4.3, 4.4_
  - [x] 12.2 Integrate checkout in PosTerminal


    - Call TransactionService on checkout
    - Clear cart after successful transaction
    - Show success message with transaction number
    - _Requirements: 4.3_
  - [x] 12.3 Write property test for transaction record completeness






    - **Property 7: Transaction Record Completeness**
    - **Validates: Requirements 4.3**
  - [x] 12.4 Write property test for inventory decrement on sale






    - **Property 8: Inventory Decrement on Sale**
    - **Validates: Requirements 4.4**

- [x] 13. Receipt Generation






  - [x] 13.1 Create ReceiptService class

    - Generate receipt data from transaction
    - Include store info from settings
    - _Requirements: 4.5_

  - [x] 13.2 Create receipt Blade view

    - Printable receipt layout
    - Store name, address, contact
    - Transaction details and totals
    - _Requirements: 4.5_
  - [x] 13.3 Write property test for receipt content






    - **Property 9: Receipt Contains Required Information**
    - **Validates: Requirements 4.5**

- [x] 14. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Transaction History






  - [x] 15.1 Create TransactionHistory Livewire component

    - Paginated transaction listing
    - Date range filter
    - View transaction details
    - _Requirements: 6.2_

- [x] 16. Reports





  - [x] 16.1 Create ReportService class


    - Calculate daily, weekly, monthly summaries
    - Get top-selling products
    - Filter by date range
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 16.2 Create SalesReport Livewire component

    - Date range picker
    - Display summaries and charts
    - Top products list
    - _Requirements: 6.1, 6.3_
  - [x] 16.3 Write property test for report date range filtering






    - **Property 14: Report Date Range Filtering**
    - **Validates: Requirements 6.2, 6.3**

- [x] 17. Layout and Responsive Design






  - [x] 17.1 Create main layout with sidebar

    - Responsive sidebar (collapsible on mobile)
    - Header with user info and logout
    - Main content area
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 17.2 Apply minimalist styling

    - Clean typography with Tailwind
    - Adequate whitespace
    - Consistent color scheme
    - _Requirements: 7.3_

- [x] 18. Dashboard






  - [x] 18.1 Create Dashboard Livewire component

    - Today's sales summary
    - Recent transactions
    - Low stock alerts
    - Quick actions
    - _Requirements: 6.1_

- [x] 19. Routes and Middleware



  - [x] 19.1 Define web routes


    - Group routes by feature
    - Apply auth middleware
    - _Requirements: 2.4_

  - [x] 19.2 Create MenuPermission middleware

    - Check user's menu_permissions for route access
    - Redirect unauthorized access to dashboard
    - _Requirements: 3.3_

- [x] 20. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

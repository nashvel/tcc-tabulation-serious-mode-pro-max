Development of Point of Sale and Inventory Management System for Alpacabon's Hardware

A PROJECT

Presented to the Faculty of the
College of Information Technology
Tagoloan Community College
Tagoloan, Misamis Oriental

In Partial Fulfillment of the Requirements for
IT 119 – System Integration and Architecture 1 and
IT 122 – Integrative Programming and Technologies 2,
Bachelor of Science in Information Technology

By

[Student Name 1] – Project Manager
[Student Name 2] – Frontend Developer
[Student Name 3] – Backend Developer
[Student Name 4] – System Analyst
[Student Name 5] – Technical Writer

December 2025


Introduction

The retail hardware industry plays a vital role in supporting construction, home improvement, and various infrastructure projects within local communities. Hardware stores serve as essential suppliers of building materials, tools, electrical components, plumbing supplies, and other construction necessities. However, many small to medium-sized hardware businesses continue to rely on traditional manual processes for managing daily sales transactions and inventory tracking, which often leads to operational inefficiencies and business challenges.

Alpacabon's Hardware is a retail establishment located in the local community that provides a wide range of hardware products and construction materials to its customers. Currently, the store operates using manual methods for recording sales transactions, computing totals, and monitoring inventory levels. This traditional approach involves handwritten receipts, manual price calculations, and physical stock counting, which are time-consuming, labor-intensive, and highly susceptible to human error. As the business grows and the volume of transactions increases, these manual processes have become increasingly inadequate to meet operational demands.

To address these challenges, the Development of Point of Sale and Inventory Management System for Alpacabon's Hardware was conceptualized. This system aims to automate sales transaction processing, streamline inventory management, and provide accurate real-time data for informed business decision-making. By replacing manual operations with a computerized system, the store can significantly reduce errors, improve transaction speed, enhance customer service, and maintain accurate inventory records.

By integrating technology into the daily operations of Alpacabon's Hardware, this project supports the modernization of small retail businesses and contributes to improved productivity and economic sustainability. The system aligns with Sustainable Development Goal 8: Decent Work and Economic Growth by promoting efficient business practices and supporting local enterprise development. Additionally, it supports Sustainable Development Goal 9: Industry, Innovation, and Infrastructure by introducing technological innovation to traditional retail operations.


Statement of the Problem

Small to medium-sized retail hardware stores face significant operational challenges when relying on manual processes for sales transactions and inventory management. Traditional methods of recording sales through handwritten receipts and tracking inventory through physical counting are prone to errors, time-consuming, and inefficient. These limitations hinder business growth, reduce customer satisfaction, and prevent store owners from making data-driven decisions.

Alpacabon's Hardware currently experiences these challenges as the store continues to use manual systems for its daily operations. The absence of an automated point of sale system results in slow transaction processing, calculation errors, and difficulty in tracking sales history. Similarly, manual inventory management leads to inaccurate stock records, unexpected stockouts, overstocking of slow-moving items, and challenges in identifying product movement patterns.

There is a clear need for a computerized system that can automate sales processing, maintain accurate inventory records, and generate comprehensive business reports. The development of a Point of Sale and Inventory Management System addresses this need by providing an integrated solution that modernizes store operations and supports efficient business management.

General Problem

How can the existing manual point of sale and inventory management processes at Alpacabon's Hardware be automated to improve operational efficiency, accuracy, and business decision-making?

Specific Problems

1. Sales transactions are processed manually, resulting in slow checkout times, computation errors, and customer dissatisfaction during peak business hours.

2. Inventory records are maintained through physical counting and handwritten logs, leading to discrepancies between actual stock levels and recorded quantities.

3. The store lacks real-time visibility into current stock levels, making it difficult to identify low-stock items and prevent stockouts or overstocking situations.

4. Generating sales reports and inventory summaries requires manual compilation of data, which is labor-intensive, time-consuming, and prone to inaccuracies.

5. Product information, sales records, and inventory data are scattered across multiple ledgers and documents, making data retrieval and analysis difficult.

6. The absence of a centralized system prevents the store from analyzing sales trends, identifying best-selling products, and making informed purchasing decisions.


Objectives of the Study

This study aims to design and develop a Point of Sale and Inventory Management System for Alpacabon's Hardware that automates sales transaction processing, streamlines inventory tracking, and provides comprehensive reporting capabilities. The system is intended to serve as a technological solution that improves operational efficiency, reduces manual errors, and supports informed business decision-making.

General Objective

To develop a web-based Point of Sale and Inventory Management System that automates sales transactions, maintains accurate inventory records, and generates business reports for Alpacabon's Hardware.

Specific Objectives

1. To develop a user-friendly point of sale interface that enables fast and accurate processing of sales transactions, including product selection, quantity entry, price computation, and receipt generation.

2. To implement an inventory management module that tracks product information, stock levels, and stock movements in real-time.

3. To design an automated low-stock alert system that notifies users when product quantities fall below defined reorder levels.

4. To create a reporting module that generates daily, weekly, and monthly sales reports, inventory status reports, and product movement summaries.

5. To implement a secure user authentication system with role-based access control for administrators, cashiers, and inventory staff.

6. To develop a centralized database that stores and organizes all product, sales, inventory, and user data for efficient retrieval and management.

7. To test and evaluate the system's functionality, usability, and reliability to ensure it meets the operational requirements of Alpacabon's Hardware.


Scope and Limitations

Scope of the Study

This study focuses on the design and development of a Point of Sale and Inventory Management System intended to automate the sales and inventory operations of Alpacabon's Hardware. The system covers the following functional components:

1. User Management – The system enables user registration, authentication, and role-based access control. User roles include Administrator, Cashier, and Inventory Staff, each with specific permissions and access levels.

2. Point of Sale Module – The system provides a streamlined interface for processing sales transactions, including product search and selection, cart management, price computation, payment processing, and receipt generation.

3. Inventory Management Module – The system allows management of product information including product name, description, category, unit price, and stock quantity. It supports adding new products, updating existing records, and tracking stock movements.

4. Stock Monitoring and Alerts – The system monitors inventory levels in real-time and generates automated alerts when stock quantities fall below predefined reorder points.

5. Category and Supplier Management – The system enables organization of products by category and maintains supplier information for procurement reference.

6. Sales and Inventory Reporting – The system generates comprehensive reports including daily sales summaries, transaction histories, inventory status reports, low-stock reports, and best-selling product analyses.

7. Dashboard and Analytics – The system provides a visual dashboard displaying key business metrics such as total sales, transaction counts, inventory summaries, and recent activities.

The study emphasizes operational efficiency, data accuracy, and user accessibility using a web-based platform.

Limitations of the Study

This project is subject to the following limitations:

1. The system is developed as a web-based application and does not include a dedicated mobile application for smartphones or tablets.

2. The system supports cash payment transactions only and does not integrate with online payment gateways such as GCash, PayMaya, or credit card processing services.

3. Barcode scanner hardware integration is not implemented in the current version; product entry is performed through manual search and selection.

4. The system is designed for single-store operation and does not support multi-branch inventory management or inter-branch stock transfers.

5. Integration with external accounting software, enterprise resource planning (ERP) systems, or third-party applications is not included.

6. The system does not include e-commerce functionality for online ordering or customer-facing product catalogs.

7. Customer loyalty programs, membership systems, or rewards point tracking are not covered in this project.


Conceptual Framework

The conceptual framework of the Point of Sale and Inventory Management System for Alpacabon's Hardware is anchored on the Input–Process–Output (IPO) Model, illustrating how user inputs are transformed into meaningful business outputs through systematic processing.

Figure XX. Conceptual Framework using IPO Model

```
┌───────────────────┐      ┌───────────────────────────────┐      ┌────────────────────┐
│      INPUT        │      │           PROCESS             │      │      OUTPUT        │
├───────────────────┤      ├───────────────────────────────┤      ├────────────────────┤
│                   │      │                               │      │                    │
│ • Product Data    │      │    Point of Sale and          │      │ • Sales Receipts   │
│                   │      │    Inventory Management       │      │                    │
│ • Sales Data      │ ───▶ │    System for Alpacabon's     │ ───▶ │ • Inventory        │
│                   │      │    Hardware                   │      │   Updates          │
│ • User Input      │      │                               │      │                    │
│                   │      │    • Sales Processing         │      │ • Business         │
│ • Stock           │      │    • Inventory Tracking       │      │   Reports          │
│   Adjustments     │      │    • Report Generation        │      │                    │
│                   │      │                               │      │ • Low Stock        │
│                   │      │                               │      │   Alerts           │
└───────────────────┘      └───────────────────────────────┘      └────────────────────┘
```


System Architecture

The system follows a Layered Client–Server Architecture where the presentation layer (users accessing through web browsers) interacts with a centralized backend responsible for processing business logic, managing data, and handling system operations. The backend is structured into modular components including user authentication, sales processing, inventory management, and reporting    services, enabling clear separation of responsibilities and efficient system scalability.

Figure XX. Layered Client-Server Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SYSTEM ARCHITECTURE                                  │
│              Point of Sale and Inventory Management System                      │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │       USERS         │
                              │  ┌───┐ ┌───┐ ┌───┐  │
                              │  │ A │ │ C │ │ I │  │
                              │  └───┘ └───┘ └───┘  │
                              │ Admin Cashier Inv.  │
                              └──────────┬──────────┘
                                         │
                                         ▼
                    ┌──────────────────────────────────────┐
                    │         PRESENTATION LAYER           │
                    │        (Web Browser Interface)       │
                    │  ┌────────────────────────────────┐  │
                    │  │   HTML │ CSS │ JavaScript     │  │
                    │  │   Blade Templates │ Tailwind  │  │
                    │  └────────────────────────────────┘  │
                    └──────────────────┬───────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │         APPLICATION LAYER            │
                    │        (Laravel PHP Framework)       │
                    │  ┌────────────────────────────────┐  │
                    │  │   Controllers │ Models         │  │
                    │  │   Routes │ Middleware          │  │
                    │  │   Services │ Policies          │  │
                    │  └────────────────────────────────┘  │
                    └──────────────────┬───────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │           DATA LAYER                 │
                    │         (MySQL Database)             │
                    │  ┌────────────────────────────────┐  │
                    │  │   Users │ Products │ Sales     │  │
                    │  │   Categories │ Suppliers       │  │
                    │  │   Inventory │ Transactions     │  │
                    │  └────────────────────────────────┘  │
                    └──────────────────────────────────────┘
```


Project Design

Figure XX. User Login

The image shows the official login interface for the Point of Sale and Inventory Management System of Alpacabon's Hardware. It presents a clean and professional design featuring the store logo on the left with a welcome message, and a secure login panel on the right. The panel includes fields for username or email, password entry, a "Remember me" option, and a prominent login button, emphasizing authorized access and system security.

Figure XX. Dashboard

The image shows the Admin Dashboard interface, designed for administrators and staff to monitor and manage store operations. The dashboard provides an overview of key business metrics such as total sales today, total products, low stock items, and recent transactions, enabling quick assessment of daily operations. It includes sections for sales summary, recent transactions, inventory alerts, and quick action buttons, allowing users to navigate efficiently to frequently used features.

Figure XX. Point of Sale Interface

The image displays the Point of Sale (POS) interface, which serves as the primary transaction processing screen for cashiers. It presents a product search and selection panel on the left, allowing quick product lookup by name or category. The right side shows the current cart with selected items, quantities, unit prices, and computed totals. Payment processing options and receipt generation buttons are prominently displayed, enabling fast and accurate checkout operations.

Figure XX. Product Management

The image shows the Product Management interface, which allows administrators and inventory staff to manage the product catalog. It presents a searchable and sortable table containing product codes, names, categories, unit prices, stock quantities, and status indicators. Action buttons allow users to view, edit, or delete individual product records, while options such as "Add Product" and "Export" support catalog expansion and data extraction.

Figure XX. Inventory Management

The image displays the Inventory Management interface, designed for tracking and managing stock levels. It presents a comprehensive view of all products with their current quantities, reorder levels, and stock status. The interface includes features for recording stock adjustments, viewing movement history, and identifying items requiring reorder. Filter and search options enable efficient navigation and quick access to specific inventory records.

Figure XX. Category Management

The image shows the Category Management interface, which allows administrators to organize products into logical groupings. It displays a list of product categories with their descriptions and the number of products assigned to each category. Users can add new categories, edit existing ones, or reorganize the category structure to improve product organization and navigation.

Figure XX. Sales Reports

The image presents the Sales Reports interface, which provides comprehensive sales analytics and reporting capabilities. It displays summary statistics including total revenue, number of transactions, and average transaction value for selected date ranges. Detailed transaction lists, graphical charts showing sales trends, and export options for PDF and Excel formats enable thorough sales analysis and documentation.

Figure XX. Inventory Reports

The image shows the Inventory Reports interface, which provides detailed stock status and movement analysis. It displays current inventory levels, stock valuation, and product movement summaries. The interface includes low-stock alerts, reorder recommendations, and historical stock movement tracking, supporting informed inventory management decisions.

Figure XX. User Management

The image displays the User Management interface, which allows administrators to manage system users and their access permissions. It presents a list of registered users showing their names, roles, email addresses, and account status. Administrators can add new users, assign roles, reset passwords, and activate or deactivate accounts to maintain system security and access control.


Tools and Technologies

Table XX. Tools and Technologies used for Development

| Component   | Tools / Languages              | Description                              |
|-------------|--------------------------------|------------------------------------------|
| Front-end   | HTML, CSS, JavaScript, Blade   | User interface and presentation          |
| Styling     | Tailwind CSS                   | Responsive design and styling framework  |
| Back-end    | PHP / Laravel Framework        | Server-side logic and business processes |
| Database    | MySQL                          | Relational data storage                  |
| Others      | Figma, VS Code, Git            | Design, development, and version control |

The Point of Sale and Inventory Management System for Alpacabon's Hardware utilizes a combination of modern web technologies to ensure efficient performance, user accessibility, and reliable data management.

The front-end is developed using HTML, CSS, JavaScript, and Laravel Blade templating, which together create the user interface where administrators, cashiers, and inventory staff interact with the system. HTML structures the content of the web pages, including forms, tables, and navigation elements. CSS, enhanced by the Tailwind CSS framework, controls the visual design, layout, colors, and responsive behavior across different screen sizes. JavaScript enables dynamic features such as real-time cart updates, form validation, and interactive elements without requiring page reloads, resulting in a smooth and responsive user experience. Blade templating allows for efficient server-side rendering and component reusability throughout the application.

The back-end of the system is powered by PHP using the Laravel Framework, which handles the core business logic, data processing, and system operations. Laravel provides a robust Model-View-Controller (MVC) architecture that organizes code efficiently and promotes maintainability. The framework includes built-in features for user authentication, database migrations, form validation, and security measures such as CSRF protection and password hashing. Controllers manage user requests and coordinate between the user interface and database, while Models define data structures and relationships. Routes direct incoming requests to appropriate controllers, and Middleware handles authentication and authorization checks.

For data storage, the system employs MySQL as the relational database management system to ensure secure and organized information management. MySQL stores all structured data including user accounts, product information, sales transactions, inventory records, categories, and suppliers. The database design follows normalization principles to minimize redundancy and maintain data integrity. Laravel's Eloquent ORM (Object-Relational Mapping) simplifies database interactions by allowing developers to work with database records as PHP objects, making queries more intuitive and secure against SQL injection attacks.

Supporting tools such as Figma, Visual Studio Code, and Git are used throughout the development process to enhance design quality and implementation efficiency. Figma assists in creating interface mockups and visual prototypes to improve usability before actual development. Visual Studio Code serves as the primary integrated development environment (IDE) for writing, editing, and debugging code with features such as syntax highlighting, code completion, and integrated terminal. Git provides version control capabilities, enabling collaborative development, change tracking, and code backup. Together, these tools contribute to a well-designed, functional, and maintainable system that effectively supports the operational needs of Alpacabon's Hardware.


REFERENCES

Point of Sale Systems and Retail Technology

• Laudon, K. C., & Traver, C. G. (2021). E-commerce 2021: Business, technology, and society (16th ed.). Pearson Education.

• Reynolds, J. (2004). The complete e-commerce book: Design, build, and maintain a successful web-based business (2nd ed.). CMP Books.

• Turban, E., King, D., Lee, J. K., Liang, T. P., & Turban, D. C. (2015). Electronic commerce: A managerial and social networks perspective (8th ed.). Springer.

Inventory Management and Supply Chain

• Chopra, S., & Meindl, P. (2016). Supply chain management: Strategy, planning, and operation (6th ed.). Pearson Education.

• Muller, M. (2019). Essentials of inventory management (3rd ed.). AMACOM.

• Wild, T. (2017). Best practice in inventory management (3rd ed.). Routledge.

System Architecture and Software Engineering

• Bass, L., Clements, P., & Kazman, R. (2012). Software architecture in practice (3rd ed.). Addison-Wesley.

• Pressman, R. S., & Maxim, B. R. (2015). Software engineering: A practitioner's approach (8th ed.). McGraw-Hill.

• Sommerville, I. (2016). Software engineering (10th ed.). Pearson Education.

• International Organization for Standardization. (2019). ISO 9241-210: Human-centered design for interactive systems. ISO.

Conceptual Framework and IPO Model

• Churchman, C. W. (1968). The systems approach. Delta Publishing.

• Oladipo, O., & Olatunji, O. (2020). Input–process–output model as a framework for evaluating computer-based systems. International Journal of Computer Applications, 176(22), 10–16.

Web Development and Programming

• Laravel. (n.d.). Laravel documentation. https://laravel.com/docs

• MySQL. (n.d.). MySQL 8.0 reference manual. Oracle Corporation. https://dev.mysql.com/doc

• PHP Group. (2023). PHP documentation. https://www.php.net/docs.php

• MDN Web Docs. (2023). HTML documentation. Mozilla Developer Network. https://developer.mozilla.org/en-US/docs/Web/HTML

• MDN Web Docs. (2023). CSS documentation. Mozilla Developer Network. https://developer.mozilla.org/en-US/docs/Web/CSS

• MDN Web Docs. (2023). JavaScript guide. Mozilla Developer Network. https://developer.mozilla.org/en-US/docs/Web/JavaScript

• Tailwind Labs. (n.d.). Tailwind CSS documentation. https://tailwindcss.com/docs

Tools, Technologies, and Development Platforms

• Figma, Inc. (n.d.). Figma: Collaborative interface design tool. https://www.figma.com

• Visual Studio Code. (n.d.). Visual Studio Code documentation. Microsoft. https://code.visualstudio.com/docs

• Git. (n.d.). Git documentation. https://git-scm.com/doc

Small Business and Retail Operations

• Scarborough, N. M., & Cornwall, J. R. (2019). Essentials of entrepreneurship and small business management (9th ed.). Pearson Education.

• Levy, M., Weitz, B. A., & Grewal, D. (2019). Retailing management (10th ed.). McGraw-Hill Education.

Policy and Institutional Alignment

• United Nations. (2015). Transforming our world: The 2030 agenda for sustainable development. https://sdgs.un.org/goals

• Department of Trade and Industry (Philippines). (2020). MSME development plan 2017-2022. DTI.

# Api_Eccomerce_Nodejs


## 🚀 Project:
https://github.com/YeiiMaccDev/API_Eccomerce_Node.git

## Description:
E-commerce api developed with Nodejs, Express, Mongoose and Mongo database.
- Authentication of the system itself or with the Google-Auth api.  
- Implementation of the JSON Web Token (JWT) standard for sending information and secure requests to the system after login.  
- Users, roles and permissions management.  
- Product and category management.  
- Implementation of Cloudinary api to store user and product images.  
Route validation: 
- Mandatory fields.
- Authentication.
- JWT without alteration.
- Role.
- Permissions.
- File format.


## API Reference
Url: https://api-eccomerce-node.vercel.app

#### Get all items
```http
  GET /api/products
```

#### Get products
```http
  GET /api/products/${id}
```

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `id`      | `string` | **Required**. Id of products to fetch |




## Run Locally
Clone the project
```bash
  git clone https://github.com/YeiiMaccDev/API_Eccomerce_Node.git
```

Go to the project directory
```bash
  cd my-project
```

Install dependencies
```bash
  npm install
```

Start the server
```bash
  npm run start
```

## Environment variables
To run this project, you will need to add the environment variables to your **.env** file, example in **.env.example**


## APIs used:
This project uses the following APIs:
- **Cloudinary:** Store images of users and products.
- **Google-Auth:** Automatic authentication with gmail account.



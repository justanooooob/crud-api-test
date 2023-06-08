Use this to get all animals list
GET = /get-animals

Use this to get animal by name
GET = /get-animal-by-name?name=...

Use this to get animal by id
GET = /get-animal?id=...

Use this to Seller by Id
GET = /get-seller?id=5

Use this to store animal
POST = /store animal
example of the data:
{
  "name": "Semut Rangrang 2",
  "description": "Ini adalah deskripsi semut Rangrang 2"
}

Use this to update the animal
POST = /update-animal
example form data:
{
  id : 
  name :
  description :
  image : file.jpg, jpeg, or png (can't use any type except this)
}

Use this to store seller
POST = /store-seller
example of the data:
{
  "name": "John Doe"
  "email": example@gmail.com
  "phone": 08123456789
}

Use this to delete the animal (soft delete)
POST = /delete-animal
example of the data:
{
  "id": 15
}

Use this to do image prediction
POST = /pred
example form data:
{
  image : file.jpg, jpeg, or png (can't use any type except this)
}

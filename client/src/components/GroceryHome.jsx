import React, { useState } from "react";
import NavBar from "./NavBar";
import DonationForm from "./DonationForm";
import UpdateDonationForm from "./UpdateDonationForm";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";
import Modal from 'react-bootstrap/Modal'
import Form from "react-bootstrap/Form";

export default function GroceryHome() {
  // Setup state for this page
  const [camera, updateCamera] = useState(true);
  const [items, updateItems] = useState([]);
  const [formData, updateFormData] = useState({
    name: "",
    quantity: 0,
    unit: "lbs",
    expiry_date: "",
    imgurl: "",
    user_id: 0
  });
 
  
  // Handle Bootstrap Modal for editing entries
  const [formItem, handleFormItem] = useState({});
  const [formItemIndex, handleFormItemIndex] = useState(0);

  const [show, updateShow] = useState(false);

  const handleClose = () => {
    updateShow(false);
  }
  
  const setFormItem = e => {
    handleFormItem(e)
  }

  const updateFormItemInItems = () => {
    console.log('formItem', formItem);
    console.log('items', items);

    const currentItems = [...items];
    currentItems[formItemIndex] = formItem;
    updateItems(currentItems);
  }

  const handleShow = (evt) => {
    setFormItem(items.find( e => e.name === evt.target.value))
    handleFormItemIndex(items.findIndex(e => e.name === evt.target.value))
    updateShow(true);
  }

  const handleUpdateFormChange = (value, propertyName) => {
    const newFormItem = {...formItem};
    newFormItem[propertyName] = value;
    handleFormItem(newFormItem);
  }

  const onSubmit = e => {
    const newFormData = { ...formData };
    let found = false;
    e.preventDefault();

    if (formData.name.length === 0 || formData.quantity <= 0) {
      if (formData.name.length === 0) {
        alert('Please fill in product name you want to donate')
      }
      if (formData.quantity <= 0) {
        alert('input valid quantity')
      }
      return;
    }
    items.forEach(i => {
      if (i.name === formData.name) {
        alert('you have the same product in your list');
        found = true;
        return;
      }
    })
    if (!found)
    updateItems([...items, newFormData]);
    updateFormData({
      name: "",
      quantity: 0,
      unit: "lbs",
      expiry_date: "",
      imgurl: "",
      user_id: JSON.parse(localStorage.getItem('user')).user_id
    })
  };

  console.log("parse",JSON.parse(localStorage.getItem('user')).user_id)


  const handleChange = (value, propertyName) => {
    const newFormData = { ...formData };
    newFormData[propertyName] = value;
    console.log('updating', newFormData);
    updateFormData(newFormData);
  };

  const handleImage = (value) => {
    items[items.length - 1].imgurl = value;
    updateItems([...items]);
  };

  const handleDonationSubmit = () => {
    console.log("itemsssssssssss", items)
     fetch('http://localhost:8080/api/products', {
       method: 'post',
       headers: {'Content-Type':'application/json'},
       body: JSON.stringify(items)
      }).then(res => {
        console.log("response",res);
    })
  }

  return (
    <>
      <NavBar camera={camera} />
      <div>Make a donation</div>
      <DonationForm
        items={items}
        formData={formData}
        onSubmit={onSubmit}
        handleChange={handleChange}
        handleImage={handleImage}
      />

        {items.length > 0 && 
        <div>
          Your donations
          <Table striped bordered hover size="sm">
  <thead>
    <tr>
      <th>#</th>
      <th>Product Name</th>
      <th>Quantity</th>
      <th>Unit</th>
      <th>Expiry Date</th>
      <th>Image</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {items.map((item, index) => {
      return (
        <tr key={item.name + index}>
          <td>{index + 1}</td>
          <td>{item.name}</td>
          <td>{item.quantity}</td>
          <td>{item.unit}</td>
          <td>{item.expiry_date}</td>
          <td><img src={item.imgurl} style={{height: '5em'}}/></td>
          <td><Button variant="info"  value={item.name} onClick={evt=> handleShow(evt)}>Edit</Button></td>
          </tr>
  );
})}
  </tbody>
</Table>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title>Edit {formItem.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <UpdateDonationForm 
                items={items}
                formData={formData}
                onSubmit={onSubmit}
                handleImage={handleImage}
                formItem={formItem}
                handleShow={handleShow}
                handleUpdateFormChange={handleUpdateFormChange}/>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" onClick={() => {handleClose(); updateFormItemInItems();}}>
              Save Changes
            </Button>
              </Modal.Footer>
            </Modal>

        </div>}
           

      {/* this button is to make a post request/ to add the donated items in the database. Call handleDonation at onClick and make a fetch request to backend*/}
      <Link to={"/"}>
        <Button variant="outline-success" onClick={handleDonationSubmit}>Donate!</Button>
      </Link>
    </>
  );
}

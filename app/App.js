import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';
import { RazorpayApiKey } from './config';

export default function App() {
  const [product, setProduct] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const onComponentMount = async () => {
    const { data } = await axios.get(
      `https://fakestoreapi.com/products/${Math.floor(Math.random() * 20)}`,
    );
    data.price = Math.ceil(data.price) * 100;
    setProduct(data);
  };

  useEffect(() => {
    onComponentMount();
  }, []);

  const createOrder = async () => {
    const { data } = await axios.post(
      'https://rn-razorpay.herokuapp.com/createOrder',
      {
        amount: product.price * 100,
        currency: 'INR',
      },
    );
    return data;
  };

  const verifyPayment = async (orderID, transaction) => {
    const { data } = await axios.post(
      'https://rn-razorpay.herokuapp.com/verifySignature',
      {
        orderID: orderID,
        transaction: transaction,
      },
    );
    return data.validSignature;
  };

  const onPay = async () => {
    console.log('OnPay');
    setPaymentProcessing(true);
    const order = await createOrder();
    var options = {
      name: product.title,
      image: product.image,
      description: product.description,
      order_id: order.id,
      key: RazorpayApiKey,
      prefill: {
        email: 'useremail@example.com',
        contact: '9191919191',
        name: 'John Doe',
      },
      theme: { color: '#a29bfe' },
    };
    RazorpayCheckout.open(options)
      .then(async (transaction) => {
        const validSignature = await verifyPayment(order.id, transaction);
        alert('Is Valid Payment: ' + validSignature);
      })
      .catch(console.log);
    setPaymentProcessing(false);
  };

  if (!product) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#a29bfe" size={60} />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Checkout</Text>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <TouchableOpacity style={styles.button} onPress={onPay}>
        {paymentProcessing ? (
          <ActivityIndicator color="white" size={30} />
        ) : (
          <Text style={styles.buttonText}>Buy for ₹ {product.price / 100}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    marginTop: 50,
    fontSize: 28,
    color: '#a29bfe',
  },
  image: {
    height: 300,
    width: 300,
    marginTop: 50,
    borderRadius: 10,
  },
  title: {
    marginTop: 30,
    fontSize: 22,
    textAlign: 'center',
    width: '80%',
    color: '#a29bfe',
  },
  description: {
    width: '80%',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    backgroundColor: '#a29bfe',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 50,
    position: 'absolute',
    bottom: 0,
    marginBottom: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});

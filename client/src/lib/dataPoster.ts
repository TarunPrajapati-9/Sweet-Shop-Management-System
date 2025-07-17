import axios, { AxiosError } from "axios";

export async function addSweet(sweetData: {
  name: string;
  category: string;
  price: number;
  quantity: number;
}) {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/sweets`,
      sweetData
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

export async function createOrder(orderData: {
  token: number;
  items: Array<{
    sweetId: number;
    quantity: number;
  }>;
}) {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders`,
      orderData
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

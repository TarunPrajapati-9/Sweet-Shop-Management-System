import axios, { AxiosError } from "axios";

export async function deleteSweet(id: number) {
  try {
    const { data } = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/sweets/${id}`
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

// Order-related delete functions
export async function cancelOrder(orderId: string) {
  try {
    const { data } = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/${orderId}`
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

export async function removeOrderItem(orderId: string, sweetId: number) {
  try {
    const { data } = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/${orderId}/items/${sweetId}`
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

// export async function getIsRegistered(): Promise<RegisterResponse> {
//   try {
//     const token = Cookies.get("studentToken");
//     if (!token) {
//       throw new Error("No token found");
//     }

//     const { data } = await axios.get(
//       `${import.meta.env.VITE_BACKEND_URL}/get/registered`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     // console.log(data);
//     return data;
//   } catch (error: AxiosError | unknown) {
//     const err = error as AxiosError;
//     return err.response?.data as RegisterResponse;
//   }
// }
import axios, { AxiosError } from "axios";

export async function editSweet(
  id: number,
  sweetData: {
    name: string;
    category: string;
    price: number;
    quantity: number;
  }
) {
  try {
    const { data } = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/sweets/${id}`,
      sweetData
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

export async function restockSweet(id: number, quantity: number) {
  try {
    const { data } = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/sweets/${id}/restock`,
      { quantity }
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

// Order-related update functions
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { data } = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/${orderId}/status`,
      { status }
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

export async function updateOrderItems(
  orderId: string,
  items: Array<{
    sweetId: number;
    quantity: number;
  }>
) {
  try {
    const { data } = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/${orderId}/items`,
      { items }
    );
    return data;
  } catch (error: AxiosError | unknown) {
    const err = error as AxiosError;
    return err.response?.data;
  }
}

"use client";
import { Product } from "./Product";

import CardBox from "../shared/CardBox";
import { useEffect, useState } from "react";

export const BestSeller = () => {
  const ProductsInfo = [
    {
      id: "product1",
      title: "Boat Headphone",
      price: 285,
      salesPrice: 375,
      rating: 4,
    },
    {
      id: "product2",
      title: "MacBook Air Pro",
      price: 675,
      salesPrice: 900,
      rating: 5,
    },
    {
      id: "product3",
      title: "Red Valvet Dress",
      price: 150,
      salesPrice: 200,
      rating: 5,
    },
    {
      id: "product4",
      title: "Cute Soft Teddybear",
      price: 285,
      salesPrice: 345,
      rating: 4,
    },
  ];
  const [orders, setAllOrders] = useState([]);
  async function handleBestSeller() {
    try {
      const response = await fetch("/api/product");
      const result = await response.json();
      const filteredOrder = result?.data?.sort(
        (a: { quantity: any }, b: { quantity: any }) =>
          Number(b.quantity) - Number(a.quantity)
      );
      setAllOrders(filteredOrder.slice(0, 4));
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    handleBestSeller();
  }, []);
  return (
    <>
      <CardBox>
        <div className="mb-0">
          <div className="flex flex-col gap-6">
            <h5 className="card-title leading-none">Best Seller</h5>
            <div className="grid grid-cols-12 gap-6">
              {orders &&
                orders.map((item: any, index) => {
                  return (
                    <div
                      key={index}
                      className="lg:col-span-3 md:col-span-6 col-span-12"
                    >
                      <Product
                        photo={item.imageUrl}
                        title={item.name}
                        price={item.price}
                        quantity={item.quantity}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </CardBox>
    </>
  );
};

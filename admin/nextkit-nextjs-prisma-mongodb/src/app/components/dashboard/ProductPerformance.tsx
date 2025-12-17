"use client";

import { Badge, Dropdown, Table, TextInput } from "flowbite-react";
import CardBox from "../shared/CardBox";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Bounce, toast } from "react-toastify";
import EditProductModal from "./EditProductModal";
import ProductFilter from "./ProductFilter";

interface Product {
  id: string;
  name: string;
  productCode: string;
  price: number;
  stock: number;
  status?: "pending" | "shipped" | "delivered";
}

export const ProductPerformance = () => {
  const [allproducts, setAllproducts] = useState<Product[]>([]);
  const [fixedProducts, setFixedProducts] = useState<Product[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [itemsCount] = useState(4);
  const [status, setStatus] = useState("All");
  const [currentPagination, setCurrentPagination] = useState(1);

  // ✅ FETCH PRODUCTS (SAFE)
  async function fetchProducts() {
    try {
      const response = await fetch("/api/product");

      if (!response.ok) {
        throw new Error("Products fetch failed");
      }

      const result = await response.json();
      const products: Product[] = Array.isArray(result.data) ? result.data : [];

      setFixedProducts(products);
      setAllproducts(products.slice(0, itemsCount));
    } catch (error) {
      console.error(error);
      setFixedProducts([]);
      setAllproducts([]);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [openModal]);

  // ✅ SEARCH
  useEffect(() => {
    if (!Array.isArray(fixedProducts)) return;

    if (inputValue.trim()) {
      const filtered = fixedProducts.filter((item) =>
        item.name?.toLowerCase().includes(inputValue.toLowerCase())
      );
      setAllproducts(filtered.slice(0, itemsCount));
    } else {
      setAllproducts(
        fixedProducts.slice(
          (currentPagination - 1) * itemsCount,
          currentPagination * itemsCount
        )
      );
    }
  }, [inputValue, fixedProducts, currentPagination]);

  // ✅ STATUS FILTER
  useEffect(() => {
    if (!Array.isArray(fixedProducts)) return;

    if (status === "All") {
      setAllproducts(
        fixedProducts.slice(
          (currentPagination - 1) * itemsCount,
          currentPagination * itemsCount
        )
      );
    } else {
      const filtered = fixedProducts.filter((item) => item.status === status);
      setAllproducts(filtered.slice(0, itemsCount));
    }
  }, [status, fixedProducts, currentPagination]);

  // ✅ DELETE PRODUCT
  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Delete failed");
      }

      toast.success("Product deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });

      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  }

  const totalPages = Math.ceil(fixedProducts.length / itemsCount);

  return (
    <>
      <CardBox>
        <div className="mb-6 flex items-center justify-between">
          <h5 className="card-title">Ürünler</h5>

          <div className="flex gap-4">
            {/* FILTER */}
            <Dropdown
              label=""
              dismissOnClick={false}
              renderTrigger={() => (
                <button className="px-4 py-1.5 rounded-md bg-lightprimary text-primary font-medium flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
                  <Icon icon="akar-icons:sort" width={18} />
                  Filtre
                </button>
              )}
            >
              {["All", "pending", "shipped", "delivered"].map((s) => (
                <Dropdown.Item key={s} onClick={() => setStatus(s)}>
                  {s}
                </Dropdown.Item>
              ))}
            </Dropdown>

            {/* SEARCH */}
            <div className="relative">
              <TextInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ürün Ara..."
                className="min-w-60"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <Table.Head className="bg-gray-50">
              <Table.HeadCell>#</Table.HeadCell>
              <Table.HeadCell>Ürün</Table.HeadCell>
              <Table.HeadCell>Fiyatı</Table.HeadCell>
              <Table.HeadCell>Stok</Table.HeadCell>
              <Table.HeadCell>Durumu</Table.HeadCell>
              <Table.HeadCell>Aksiyon</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {allproducts.map((item, index) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{index + 1}</Table.Cell>
                  <Table.Cell>
                    <p className="font-semibold">{item.name}</p>
                    <span className="text-xs text-muted">
                      {item.productCode}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{item.price}</Table.Cell>
                  <Table.Cell>{item.stock}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        item.status === "delivered"
                          ? "success"
                          : item.status === "shipped"
                          ? "warning"
                          : "failure"
                      }
                      size="xs"
                    >
                      {item.status || "pending"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      label=""
                      renderTrigger={() => (
                        <Icon
                          icon="tabler:dots-vertical"
                          className="cursor-pointer"
                        />
                      )}
                    >
                      <Dropdown.Item
                        onClick={() => {
                          setActiveProduct(item);
                          setOpenModal(true);
                        }}
                      >
                        Düzenle
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDelete(item.id)}>
                        Sil
                      </Dropdown.Item>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-end gap-1 p-4">
            <button
              disabled={currentPagination === 1}
              onClick={() => setCurrentPagination((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 border rounded"
            >
              Önceki
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPagination(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPagination === i + 1
                    ? "bg-lightprimary text-primary"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPagination === totalPages}
              onClick={() =>
                setCurrentPagination((p) => Math.min(p + 1, totalPages))
              }
              className="px-3 py-1 border rounded"
            >
              Sonraki
            </button>
          </div>
        </div>
      </CardBox>

      {activeProduct && (
        <EditProductModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          activeProduct={activeProduct}
        />
      )}

      <ProductFilter
        openModal={false}
        setOpenModal={() => {}}
        allproducts={allproducts}
        setAllproducts={setAllproducts}
        fixedProducts={fixedProducts}
      />
    </>
  );
};

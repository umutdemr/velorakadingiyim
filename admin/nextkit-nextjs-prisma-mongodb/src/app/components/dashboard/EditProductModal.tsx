"use client";

import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  TextInput,
  Select,
  Textarea,
} from "flowbite-react";
import { useEffect, useReducer, useState } from "react";
import { Bounce, toast } from "react-toastify";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

export default function EditProductModal({
  openModal,
  setOpenModal,
  activeProduct,
}: any) {
  const initialProductInfo = {
    name: activeProduct.name || "",
    productCode: activeProduct.productCode || "",
    price: activeProduct.price || 0,
    images: (activeProduct.images || []).join(","),
    description: activeProduct.description || "",
    content: activeProduct.content || "",
    modelSizes: activeProduct.modelSizes || "",
    sizes: (activeProduct.sizes || []).join(","),
    washing: activeProduct.washing || "",
    categoryId: activeProduct.categoryId || "",
    stock: activeProduct.stock || 0,
    slug: activeProduct.slug || "",
  };

  type Action = {
    type: "SET_FIELD";
    payload: { field: keyof typeof initialProductInfo; value: string | number };
  };

  function reducer(state: any, action: Action) {
    switch (action.type) {
      case "SET_FIELD":
        return { ...state, [action.payload.field]: action.payload.value };
      default:
        return state;
    }
  }

  const [productInfo, dispatch] = useReducer(reducer, initialProductInfo);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* Categories fetch */
  useEffect(() => {
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));
  }, []);

  /* Active product değişince state’i senkronla */
  useEffect(() => {
    Object.keys(initialProductInfo).forEach((field) => {
      let value: any = activeProduct[field] || "";
      if (field === "images" || field === "sizes") {
        value = (activeProduct[field] || []).join(",");
      }
      dispatch({ type: "SET_FIELD", payload: { field: field as any, value } });
    });

    const activeCategory = categories.find(
      (c) => c.id === activeProduct.categoryId
    );
    if (activeCategory?.parentId) {
      setParentCategoryId(activeCategory.parentId);
    }
  }, [activeProduct, categories]);

  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = categories.filter(
    (c) => c.parentId === parentCategoryId
  );

  async function handleEdit() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/product", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...productInfo,
          images: productInfo.images.split(",").map((i: string) => i.trim()),
          sizes: productInfo.sizes.split(",").map((s: string) => s.trim()),
          price: Number(productInfo.price),
          stock: Number(productInfo.stock),
          id: activeProduct.id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Product updated successfully!", {
          transition: Bounce,
        });
        setOpenModal(false);
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)} size="lg">
      <ModalHeader>Update Product</ModalHeader>
      <ModalBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <Label value="Product Name" />
            <TextInput
              value={productInfo.name}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "name", value: e.target.value },
                })
              }
            />
          </div>

          <div>
            <Label value="Product Code" />
            <TextInput
              value={productInfo.productCode}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "productCode", value: e.target.value },
                })
              }
            />
          </div>

          <div>
            <Label value="Price" />
            <TextInput
              type="number"
              value={productInfo.price}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "price", value: Number(e.target.value) },
                })
              }
            />
          </div>

          <div>
            <Label value="Main Category" />
            <Select
              value={parentCategoryId}
              onChange={(e) => {
                setParentCategoryId(e.target.value);
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "categoryId", value: "" },
                });
              }}
            >
              <option value="">Select main category</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          {parentCategoryId && (
            <div>
              <Label value="Sub Category" />
              <Select
                value={productInfo.categoryId}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    payload: {
                      field: "categoryId",
                      value: e.target.value,
                    },
                  })
                }
              >
                <option value="">Select sub category</option>
                {childCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label value="Images (comma separated)" />
            <TextInput
              value={productInfo.images}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "images", value: e.target.value },
                })
              }
            />
          </div>

          <div>
            <Label value="Sizes (comma separated)" />
            <TextInput
              value={productInfo.sizes}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "sizes", value: e.target.value },
                })
              }
            />
          </div>

          <div>
            <Label value="Stock" />
            <TextInput
              type="number"
              value={productInfo.stock}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "stock", value: Number(e.target.value) },
                })
              }
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Update Product"}
            </Button>
            <Button color="failure" onClick={() => setOpenModal(false)}>
              Close
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

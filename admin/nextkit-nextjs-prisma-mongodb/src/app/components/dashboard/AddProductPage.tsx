"use client";
import { Button, Label, Spinner, TextInput, Textarea } from "flowbite-react";
import { useReducer, useState } from "react";
import { toast, Bounce } from "react-toastify";
import CardBox from "../shared/CardBox";

interface ProductInfo {
  name: string;
  productCode: string;
  price: number;
  images: string; // Virgülle ayrılmış string olarak tutulacak
  description?: string;
  content?: string;
  modelSizes?: string;
  sizes?: string; // Virgülle ayrılmış string
  washing?: string;
  categoryId?: string;
  stock: number;
  slug: string;
}

type Action = {
  type: "SET_FIELD";
  payload: { field: keyof ProductInfo; value: string | number };
};

const initialProductInfo: ProductInfo = {
  name: "",
  productCode: "",
  price: 0,
  images: "",
  description: "",
  content: "",
  modelSizes: "",
  sizes: "",
  washing: "",
  categoryId: "",
  stock: 0,
  slug: "",
};

export default function AddProductPage() {
  const [productInfo, dispatch] = useReducer(
    (state: ProductInfo, action: Action) => {
      switch (action.type) {
        case "SET_FIELD":
          return { ...state, [action.payload.field]: action.payload.value };
        default:
          return state;
      }
    },
    initialProductInfo
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...productInfo,
          images: productInfo.images.split(",").map((img) => img.trim()),
          sizes: productInfo.sizes?.split(",").map((s) => s.trim()) || [],
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Product added successfully!", {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
        });
      } else {
        toast.error(result.error || "Failed to add product", {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error(error, "Failed to add product!");
      toast.error("Internal server error", {
        position: "top-right",
        autoClose: 5000,
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardBox>
      <h5 className="card-title mb-4">Add New Product</h5>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(
          [
            { field: "name", label: "Product Name", type: "text" },
            { field: "productCode", label: "Product Code", type: "text" },
            { field: "price", label: "Price", type: "number" },
            {
              field: "images",
              label: "Images (comma separated)",
              type: "text",
            },
            { field: "sizes", label: "Sizes (comma separated)", type: "text" },
            { field: "description", label: "Description", type: "textarea" },
            { field: "content", label: "Content", type: "textarea" },
            { field: "modelSizes", label: "Model Sizes", type: "text" },
            { field: "washing", label: "Washing Instructions", type: "text" },
            { field: "categoryId", label: "Category ID", type: "text" },
            { field: "stock", label: "Stock", type: "number" },
            { field: "slug", label: "Slug", type: "text" },
          ] as const
        ).map((item) => (
          <div key={item.field}>
            <Label htmlFor={item.field} value={item.label} />
            {item.type === "textarea" ? (
              <Textarea
                id={item.field}
                value={productInfo[item.field] as string}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    payload: { field: item.field, value: e.target.value },
                  })
                }
              />
            ) : (
              <TextInput
                id={item.field}
                type={item.type}
                value={productInfo[item.field] as string | number}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    payload: {
                      field: item.field,
                      value:
                        item.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    },
                  })
                }
              />
            )}
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Add Product"}
          </Button>
          <Button
            type="button"
            color="failure"
            onClick={() =>
              dispatch({
                type: "SET_FIELD",
                payload: { field: "name", value: "" },
              })
            }
          >
            Reset
          </Button>
        </div>
      </form>
    </CardBox>
  );
}

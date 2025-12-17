"use client";

import {
  Button,
  Label,
  Spinner,
  TextInput,
  Textarea,
  Select,
} from "flowbite-react";
import { useEffect, useReducer, useState } from "react";
import { toast, Bounce } from "react-toastify";
import CardBox from "@/app/components/shared/CardBox";
import slugify from "slugify";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface ProductInfo {
  name: string;
  productCode: string;
  price: number;
  images: string;
  description?: string;
  content?: string;
  modelSizes?: string;
  sizes?: string;
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));
  }, []);

  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = categories.filter(
    (c) => c.parentId === parentCategoryId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productInfo.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...productInfo,
          slug: slugify(productInfo.name, { lower: true, strict: true }),
          images: productInfo.images.split(",").map((i) => i.trim()),
          sizes: productInfo.sizes?.split(",").map((s) => s.trim()) || [],
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Product added successfully!", {
          transition: Bounce,
        });
      } else {
        toast.error(result.error || "Failed to add product");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardBox>
      <h5 className="card-title mb-4">Yeni Ürün Ekle</h5>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label value="Ürün İsmi" />
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
          <Label value="Ürün Kodu" />
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
          <Label value="Fiyatı" />
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
          <Label value="Ana Kategori" />
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
            <option value="">Ana kategoriyi seçin</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        {parentCategoryId && (
          <div>
            <Label value="Alt Kategori" />
            <Select
              value={productInfo.categoryId}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "categoryId", value: e.target.value },
                })
              }
            >
              <option value="">Alt Kategoriyi Seçin</option>
              {childCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label value="Resimler" />
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
          <Label value="Bedenler (virgülle ayrılmış)" />
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
          <Label value="Açıklamalar" />
          <Textarea
            value={productInfo.description}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                payload: { field: "description", value: e.target.value },
              })
            }
          />
        </div>

        <div>
          <Label value="Stok" />
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

        <Button color="blue" type="submit" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : "Ürünü Ekle"}
        </Button>
      </form>
    </CardBox>
  );
}

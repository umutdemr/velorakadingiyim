"use client";

import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TextInput,
  Select,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CardBox from "@/app/components/shared/CardBox";
import slugify from "slugify";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  async function fetchCategories() {
    const res = await fetch("/api/category");
    const data = await res.json();
    setCategories(data.data || []);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleAddCategory() {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const slug = slugify(name, { lower: true, strict: true });

    const res = await fetch("/api/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        parentId: parentId || null,
      }),
    });

    if (res.ok) {
      toast.success("Category added");
      setName("");
      setParentId("");
      setOpenModal(false);
      fetchCategories();
    } else {
      toast.error("Failed to add category");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/category?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error("Delete failed");
    }
  }

  return (
    <CardBox>
      <div className="flex justify-between items-center mb-6">
        <h5 className="card-title">Kategoriler</h5>
        <Button color="blue" onClick={() => setOpenModal(true)}>
          Kategori Ekle
        </Button>
      </div>

      <Table>
        <Table.Head>
          <Table.HeadCell>#</Table.HeadCell>
          <Table.HeadCell>İsim</Table.HeadCell>
          <Table.HeadCell>Slug</Table.HeadCell>
          <Table.HeadCell>Parent</Table.HeadCell>
          <Table.HeadCell>Sil</Table.HeadCell>
        </Table.Head>

        <Table.Body>
          {categories.map((cat, index) => (
            <Table.Row key={cat.id}>
              <Table.Cell>{index + 1}</Table.Cell>
              <Table.Cell className="font-medium">{cat.name}</Table.Cell>
              <Table.Cell>{cat.slug}</Table.Cell>
              <Table.Cell>
                {cat.parent ? cat.parent.name : "— (Main Category)"}
              </Table.Cell>
              <Table.Cell>
                <Button
                  color="failure"
                  size="xs"
                  onClick={() => handleDelete(cat.id)}
                >
                  Sil
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* Add Modal */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>Kategori Ekle</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <Label value="Kategori İsmi" />
              <TextInput
                placeholder="Alt Giyim / Jeans / Elbise"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label value="Üst Kategori (İsteğe bağlı)" />
              <Select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">— Üst Kategori —</option>
                {categories
                  .filter((cat) => !cat.parentId) // sadece ana kategoriler
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </Select>
            </div>

            <Button color="blue" onClick={handleAddCategory}>
              Kaydet
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </CardBox>
  );
}

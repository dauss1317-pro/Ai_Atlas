"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export default function Settings() {
  const [Document, setDocument] = useState(null);
  const [Page, setPage] = useState(null);
  const [axiCategories, setAxiCategories] = useState([]);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { Document: Doc, Page: Pg, pdfjs } = await import("react-pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        setDocument(() => Doc);
        setPage(() => Pg);
      } catch (err) {
        console.error("Failed to load react-pdf:", err);
      }
    })();
  }, []);

  useEffect(() => {
    fetch("/api/axi")
      .then((res) => res.json())
      .then((data) => setAxiCategories(data))
      .catch(console.error);
  }, []);

  const filterCategory = ({ title, description }) => {
    const search = filter.toLowerCase();
    return (
      (title?.toLowerCase() || "").includes(search) ||
      (description?.toLowerCase() || "").includes(search)
    );
  };

  const openModal = (pdfLink) => {
    if (!pdfLink) return;
    setSelectedPdf(pdfLink);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPdf(null);
    setModalOpen(false);
    setNumPages(null);
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
  const toggleCategory = (category) =>
    setOpenCategory(openCategory === category ? null : category);

  if (!Document || !Page) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6">
      {/* Filter bar */}
      <input
        type="text"
        placeholder="🔍 Search..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6 p-3 border rounded-lg w-full sm:max-w-md text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400"
      />

      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        AXI Documents
      </h1>

      <div className="w-full max-w-6xl space-y-4">
        {axiCategories.map((cat) => {
          const filteredItems = cat.items.filter(filterCategory);
          return (
            <div key={cat.category} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Accordion header */}
              <button
                onClick={() => toggleCategory(cat.category)}
                className="w-full flex justify-between items-center p-4 text-left text-lg font-semibold text-gray-800 border-b hover:bg-gray-100 transition-all"
              >
                <span className="truncate max-w-[80%]">
                  📁 {cat.category.replace(/_/g, " ")}
                </span>
                {openCategory === cat.category ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>

              {/* Accordion content */}
              <AnimatePresence>
                {openCategory === cat.category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {filteredItems.length > 0 ? (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
                        {filteredItems.map(({ id, title, description, pdf_link }) => (
                          <div
                            key={id}
                            onClick={() => openModal(pdf_link)}
                            className="cursor-pointer bg-gray-50 hover:bg-blue-50 rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-all break-words"
                          >
                            <h3 className="text-base sm:text-lg font-semibold mb-1 text-blue-700 truncate">
                              {title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 p-4 text-sm italic">
                        No results match your filter.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* PDF Modal */}
      {modalOpen && selectedPdf && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg relative w-full max-w-4xl max-h-[90vh] overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold"
            >
              ✖
            </button>

            <div className="flex justify-center items-center w-full">
              <Document file={selectedPdf} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={Math.min(window.innerWidth * 0.9, 700)}
                    className="mx-auto mb-4"
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

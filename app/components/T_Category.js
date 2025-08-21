"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
// CSS imports
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export default function Settings() {
  const [Document, setDocument] = useState(null);
  const [Page, setPage] = useState(null);

  const [axiCategories, setAxiCategories] = useState([]);
  const [aoiCategories, setAoiCategories] = useState([]);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);

  // Dynamically load react-pdf on client side
  useEffect(() => {
    (async () => {
      try {
        // Import react-pdf dynamically
        const { Document: Doc, Page: Pg, pdfjs } = await import("react-pdf");

        // Set PDF.js worker to public folder (string path!)
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        // Save dynamically imported components
        setDocument(() => Doc);
        setPage(() => Pg);
      } catch (err) {
        console.error("Failed to load react-pdf:", err);
      }
    })();
  }, []);

  // Fetch AXI and AOI categories
  useEffect(() => {
    fetch("/api/axi")
      .then((res) => res.json())
      .then((data) => setAxiCategories(data))
      .catch(console.error);

    // fetch("/api/aoi")
    //   .then((res) => res.json())
    //   .then((data) => setAoiCategories(data))
    //   .catch(console.error);
  }, []);

  // Filter function
  const filterCategory = ({ title, description }) => {
    const search = filter.toLowerCase();
    return (
      title.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  };

  const filteredAxi = axiCategories.filter(filterCategory);
  const filteredAoi = aoiCategories.filter(filterCategory);

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

  // Wait until Document/Page are loaded
  if (!Document || !Page) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto border rounded-lg">
      {/* Filter */}
      <input
        type="text"
        placeholder="Filter categories..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-6 p-2 border rounded w-full max-w-sm mx-auto block text-gray-700"
      />

      {/* AXI */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">AXI</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAxi.map(({ id, title, description, pdf_link }) => (
          <div
            key={id}
            onClick={() => openModal(pdf_link)}
            className="cursor-pointer bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600">{title}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
          </div>
        ))}
      </div>

      {/* AOI */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800 mt-10 text-center">AOI</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAoi.map(({ id, title, description, pdf_link }) => (
          <div
            key={id}
            onClick={() => openModal(pdf_link)}
            className="cursor-pointer bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-600">{title}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
          </div>
        ))}
      </div>

      {/* PDF Modal */}
        {modalOpen && selectedPdf && (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4"
            onClick={closeModal} // clicking the overlay closes modal
        >
            <div
            className="bg-white rounded-lg relative w-full max-w-4xl max-h-[90vh] overflow-auto p-4"
            style={{ justifyItems: "center" }}
            onClick={(e) => e.stopPropagation()} // prevent click inside modal from closing
            >
            <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold"
            >
                ✖
            </button>

            <Document file={selectedPdf} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (_, index) => (
                <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={Math.min(window.innerWidth - 64, 700)}
                    className="mb-4"
                />
                ))}
            </Document>
            </div>
        </div>
        )}
    </div>
  );
}

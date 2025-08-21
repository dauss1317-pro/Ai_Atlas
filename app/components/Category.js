"use client";

export default function Settings() {
  const settingsCategories = [
  {
    id: 1,
    title: "Write an Articles",
    description: "Generate well-written articles on any topic you want.",
    link: "./chat/assistant-chat.html",
    image: "https://static.vecteezy.com/system/resources/previews/006/389/884/non_2x/content-writing-icon-free-vector.jpg",
    items: ["Topic research", "SEO optimization", "Multiple languages"],
  },
  {
    id: 2,
    title: "Chatbot Assistant",
    description: "Interact with an AI-powered chatbot for various tasks.",
    link: "./chat/chatbot.html",
    image: "https://www.shutterstock.com/image-vector/3d-artificial-intelligence-digital-brain-600nw-2288372371.jpg",
    items: ["Customer support", "FAQ handling"],
  },
  {
    id: 3,
    title: "Email Summarize",
    description: "Rephrase an email with an AI-powered",
    link: "./chat/chatbot.html",
    image: "https://img.freepik.com/premium-vector/email-vector-illustration-white-background_917213-247178.jpg",
    items: ["Email drafting", "Rephrase email"],
  },
  {
    id: 4,
    title: "Write an Articles",
    description: "Generate well-written articles on any topic you want.",
    link: "./chat/assistant-chat.html",
    image: "https://static.vecteezy.com/system/resources/previews/006/389/884/non_2x/content-writing-icon-free-vector.jpg",
    items: ["Topic research", "SEO optimization", "Multiple languages"],
  },
  {
    id: 5,
    title: "Chatbot Assistant",
    description: "Interact with an AI-powered chatbot for various tasks.",
    link: "./chat/chatbot.html",
    image: "https://www.shutterstock.com/image-vector/3d-artificial-intelligence-digital-brain-600nw-2288372371.jpg",
    items: ["Customer support", "FAQ handling"],
  },
  {
    id: 6,
    title: "Email Summarize",
    description: "Rephrase an email with an AI-powered",
    link: "./chat/chatbot.html",
    image: "https://img.freepik.com/premium-vector/email-vector-illustration-white-background_917213-247178.jpg",
    items: ["Email drafting", "Rephrase email"],
  },
  // more categories...
];


  return (
    <div className="p-6 max-w-7xl mx-auto" style={{border:"solid", borderRadius: "10px"}}>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Ai Assistant</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map(({ id, title, description, items, link, image }) => (
            <a
            key={id}
            // href={link}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition block"
            >
            {/* Image container */}
            {image && (
                <div className="overflow-hidden rounded-md mb-4" style={{justifyItems: 'anchor-center'}}> 
                <img src={image} alt={title} className="w-64 object-cover" style={{maxWidth:"50%"}}/> {/*original w-full */}
                </div>
            )}

            {/* Title */}
            <h2 className="text-xl font-semibold mb-2 text-blue-600">{title}</h2>

            {/* Description */}
            <p className="text-gray-600 mb-4">{description}</p>

            {/* Optional list of items */}
            {items && items.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                {items.map((item, idx) => (
                    <li key={idx} className="hover:text-blue-500 cursor-pointer">
                    {item}
                    </li>
                ))}
                </ul>
            )}
            </a>
        ))}
        </div>
    </div>
  );
}

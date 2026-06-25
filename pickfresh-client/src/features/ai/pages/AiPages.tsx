import { useDropzone } from "react-dropzone";
import { Bot, CalendarDays, Camera, ChefHat, Mic, Salad, Sparkles, Upload } from "lucide-react";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, Input, Textarea } from "../../../components/ui";

const tools = [
  { title: "AI Grocery Assistant", icon: Bot, body: "Ask for cart planning, pantry substitutions, and budget-friendly baskets." },
  { title: "Recipe Generator", icon: ChefHat, body: "Turn selected products into recipes and one-click grocery lists." },
  { title: "Meal Planner", icon: CalendarDays, body: "Plan weekly meals with nutrition, preferences, and delivery slots." },
  { title: "Smart Recommendations", icon: Sparkles, body: "Personalized suggestions from orders, seasonality and trends." },
  { title: "Nutrition Assistant", icon: Salad, body: "Understand macros, allergens and healthier swaps." },
  { title: "Voice Assistant UI", icon: Mic, body: "Voice-led search and hands-free grocery planning." },
];

export const AiHubPage = () => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: { "image/*": [] }, maxFiles: 1 });

  return (
    <section className="container-px py-8">
      <Seo title="AI grocery assistant" description="Recipe generator, meal planner, recommendations, nutrition assistant, image search upload and voice assistant UI." />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <Badge><Sparkles className="mr-1 h-3.5 w-3.5" /> AI features</Badge>
          <h1 className="mt-4 page-title lg:text-5xl">Plan meals and baskets with PickFresh AI.</h1>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {tools.map((tool) => <Card key={tool.title} className="p-6"><tool.icon className="h-8 w-8 text-primary-600" /><h2 className="mt-4 text-xl font-black">{tool.title}</h2><p className="mt-2 text-sm muted-copy">{tool.body}</p></Card>)}
          </div>
        </div>
        <Card className="h-fit p-6">
          <h2 className="text-2xl font-black">Image search upload</h2>
          <div {...getRootProps()} className="mt-4 grid h-48 cursor-pointer place-items-center rounded-2xl border border-dashed border-primary-300 bg-primary-50 text-center dark:bg-primary-500/10">
            <input {...getInputProps()} />
            <div><Camera className="mx-auto h-8 w-8 text-primary-600" /><p className="mt-2 text-sm">{isDragActive ? "Drop the image" : "Upload pantry or produce image"}</p></div>
          </div>
          <Textarea className="mt-4" placeholder="Tell AI your diet, budget, or recipe goal" />
          <div className="mt-4 flex gap-2"><Button><Upload className="h-4 w-4" /> Generate plan</Button><Button variant="outline"><Mic className="h-4 w-4" /> Voice</Button></div>
        </Card>
      </div>
    </section>
  );
};

export const SearchPage = () => (
  <section className="container-px py-8">
    <Seo title="Global search" description="Autocomplete, voice search UI, recent searches, popular searches and advanced filters." />
    <Card className="p-6">
      <h1 className="page-title">Global search</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_auto]"><Input placeholder="Search products, brands, categories" /><Button><Mic className="h-4 w-4" /> Voice</Button><Button variant="outline">Advanced filters</Button></div>
    </Card>
  </section>
);

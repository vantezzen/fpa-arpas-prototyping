import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../ui/drawer";
import { Button } from "../../ui/button";
import { Plus, X } from "lucide-react";
import { OBJECTS, useDraftStorage } from "../storage";
import ObjectDemo from "./ObjectDemo";
import { Card } from "../../ui/card";

function ObjectSelector() {
  const { draft, setDraft } = useDraftStorage();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {draft.placeObjectUrl ? (
        <Button
          className="fixed bottom-4 right-4 "
          style={{ zIndex: 9999 }}
          onClick={() => {
            setDraft({
              ...draft,
              placeObjectUrl: undefined,
            });
          }}
        >
          <X size={24} />
        </Button>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button className="fixed bottom-4 right-4" style={{ zIndex: 9999 }}>
              <Plus size={24} />
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Objekt hinzufügen</DrawerTitle>
            </DrawerHeader>

            <div className="grid grid-cols-3 gap-3 mb-12">
              {OBJECTS.map((object, index) => (
                <button
                  key={index}
                  className="cursor-pointer w-full h-32"
                  onClick={() => {
                    setDraft({
                      ...draft,
                      placeObjectUrl: object.url,
                    });
                    setIsOpen(false);
                  }}
                >
                  <ObjectDemo url={object.url} />
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

export default ObjectSelector;

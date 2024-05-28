"use client";
import NoSsr from "@/components/NoSsr";
import { AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Root from "@/components/webxr/ThreeRoot";
import React, { useEffect } from "react";

export default function Home() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <NoSsr>
      <Root onConfetti={() => setShowModal(true)} />

      {showModal && (
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ahorn-Baum</AlertDialogTitle>
              <AlertDialogDescription>
                An dieser Stelle wird ein Ahorn-Baum gepflanzt, da sich diese
                Baum-Art aufgrund der Nähe zum Wasser und der guten
                Lichtverhältnisse hier besonders wohl fühlt.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Button onClick={() => setShowModal(false)}>Schließen</Button>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </NoSsr>
  );
}

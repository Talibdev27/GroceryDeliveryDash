import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type AppComingSoonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AppComingSoonDialog({ open, onOpenChange }: AppComingSoonDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("comingSoonDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("comingSoonDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-neutral-700">
          <div>
            <div className="font-medium mb-1">{t("comingSoonDialog.installWebApp")}</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("comingSoonDialog.iosInstructions")}</li>
              <li>{t("comingSoonDialog.androidInstructions")}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t("comingSoonDialog.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



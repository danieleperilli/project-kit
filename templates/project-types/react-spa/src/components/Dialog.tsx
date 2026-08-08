import { AlertDialog } from "radix-ui";
import { type MouseEvent, type ReactNode, useState } from "react";
import { omit, wait } from "../utils/utils";
import Anchor from "./Anchor";
import Button, { type ButtonProps } from "./Button";
import ControlIcon from "./ControlIcon";

interface IHelpLink {
    text: string;
    url: string;
}

interface IDialogButton extends ButtonProps {
    preventClose?: boolean;
}

interface Props {
    title: string;
    trigger?: ReactNode;
    children: ReactNode;
    buttons?: IDialogButton[];
    hasX?: boolean;
    help?: IHelpLink;
    className?: string;
}

/**
 * Render an alert dialog with optional asynchronous action buttons.
 * @param props Component properties.
 */
export default function Dialog({ className, title, trigger, children, buttons, hasX = true, help }: Props) {
    const [open, setOpen] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    /**
     * Close the dialog unless an asynchronous action is running.
     */
    const closeDialog = () => {
        if (!isWaiting) {
            setOpen(false);
        }
    };

    /**
     * Run one dialog action and close after it succeeds unless the action opts out.
     * @param button Button definition.
     * @param event Click event forwarded by the button.
     */
    const handleButtonClick = async (button: IDialogButton, event: MouseEvent<HTMLElement>) => {
        if (button.disabled || isWaiting) {
            return;
        }

        if (!button.onClick) {
            if (!button.preventClose) {
                setOpen(false);
            }

            return;
        }

        setIsWaiting(true);
        await wait(100);

        try {
            await button.onClick(event);

            if (!button.preventClose) {
                setOpen(false);
            }
        } finally {
            setIsWaiting(false);
        }
    };

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger asChild>
                <span>{trigger}</span>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="dialog-overlay" />
                <AlertDialog.Content className={`dialog-content ${className || ""}`}>
                    {hasX && <ControlIcon icon="x" className="dialog-close" onClick={closeDialog} />}
                    <AlertDialog.Title className="dialog-title">
                        {title}
                    </AlertDialog.Title>
                    <AlertDialog.Description asChild>
                        <div className="dialog-desc">{children}</div>
                    </AlertDialog.Description>
                    <div className="dialog-footer">
                        {help && <Anchor linkTo={help.url} className="help-link icon-info" isCtA>{help.text}</Anchor>}
                        <div className="dialog-buttons">
                            {buttons?.length ? buttons.map((button, index) => {
                                const buttonProps = omit(button, "preventClose");

                                return (
                                    <Button key={index} {...buttonProps} disabled={isWaiting || button.disabled} onClick={async (event) => handleButtonClick(button, event)} />
                                );
                            }) : (
                                <AlertDialog.Action asChild>
                                    <Button>Ok</Button>
                                </AlertDialog.Action>
                            )}
                        </div>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}

import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setLight, setDark, setSystem } = useThemeContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-xl">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={setLight} className="cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
          {theme === 'light' && <span className="ml-auto text-purple-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setDark} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
          {theme === 'dark' && <span className="ml-auto text-purple-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setSystem} className="cursor-pointer">
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
          {theme === 'system' && <span className="ml-auto text-purple-500">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

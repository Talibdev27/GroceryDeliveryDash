import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, UserPlus, LogIn, Phone, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const { t } = useTranslation();
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/products");
    }
  }, [user, setLocation]);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // debounce
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const success = await login(loginData.username, loginData.password);
      if (success) {
        setSuccess(t("auth.loginSuccess"));
        // Redirect to products page after successful login
        setTimeout(() => {
          setLocation("/products");
        }, 1500);
      } else {
        setError(t("auth.loginError"));
      }
    } catch (err) {
      setError(t("auth.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // debounce
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (registerData.password !== registerData.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone,
      });

      if (success) {
        setSuccess(t("auth.registerSuccess"));
        // Redirect to products page after successful registration
        setTimeout(() => {
          setLocation("/products");
        }, 1500);
      } else {
        setError(t("auth.registerError"));
      }
    } catch (err) {
      setError(t("auth.registerFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login / Register - Diyor Market</title>
        <meta name="description" content="Login or create an account with Diyor Market" />
      </Helmet>

      <div className="bg-neutral-50 py-8 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Link href="/">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-xl">D</span>
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-800">Diyor Market</h1>
                </div>
              </Link>
              <p className="text-neutral-600">
                {t("auth.signInDescription")}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">{t("auth.welcomeTitle")}</CardTitle>
                <CardDescription className="text-center">
                  {t("auth.welcomeDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {t("auth.login")}
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {t("auth.register")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">{t("auth.username")}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            id="login-username"
                            type="text"
                            placeholder={t("auth.usernamePlaceholder")}
                            value={loginData.username}
                            onChange={(e) =>
                              setLoginData({ ...loginData, username: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">{t("auth.password")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder={t("auth.passwordPlaceholder")}
                            value={loginData.password}
                            onChange={(e) =>
                              setLoginData({ ...loginData, password: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                          <button
                            type="button"
                            aria-label="toggle password visibility"
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                            onClick={() => setShowLoginPassword((v) => !v)}
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? t("auth.signingIn") : t("auth.signIn")}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">{t("auth.firstName")}</Label>
                          <Input
                            id="register-firstName"
                            type="text"
                            placeholder={t("auth.firstNamePlaceholder")}
                            value={registerData.firstName}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, firstName: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">{t("auth.lastName")}</Label>
                          <Input
                            id="register-lastName"
                            type="text"
                            placeholder={t("auth.lastNamePlaceholder")}
                            value={registerData.lastName}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, lastName: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-username">{t("auth.username")}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            id="register-username"
                            type="text"
                            placeholder={t("auth.chooseUsername")}
                            value={registerData.username}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, username: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">{t("auth.email")}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder={t("auth.emailPlaceholder")}
                            value={registerData.email}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, email: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-phone">{t("auth.phoneNumber")}</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder={t("auth.phonePlaceholder")}
                            value={registerData.phone}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, phone: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">{t("auth.password")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            id="register-password"
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder={t("auth.createPasswordPlaceholder")}
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, password: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                          <button
                            type="button"
                            aria-label="toggle password visibility"
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                            onClick={() => setShowRegisterPassword((v) => !v)}
                          >
                            {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirmPassword">{t("auth.confirmPassword")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            id="register-confirmPassword"
                            type={showRegisterConfirm ? "text" : "password"}
                            placeholder={t("auth.confirmPasswordPlaceholder")}
                            value={registerData.confirmPassword}
                            onChange={(e) =>
                              setRegisterData({ ...registerData, confirmPassword: e.target.value })
                            }
                            className="pl-10"
                            required
                          />
                          <button
                            type="button"
                            aria-label="toggle confirm password visibility"
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                            onClick={() => setShowRegisterConfirm((v) => !v)}
                          >
                            {showRegisterConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? t("auth.creatingAccount") : t("auth.createAccount")}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {error && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-4">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 text-center">
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      {t("auth.backToHome")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

# -*- coding: utf-8 -*-
"""
Created on Sun Nov  6 11:10:45 2022

@author: mikey
"""
#%%

# Libary Importations
import numpy as np
import matplotlib.pyplot as plt 
import csv
import time
import simpy
import math

# function calls 
# Primary Node Equations

'''
def A_pwi(N,Dit,Li):
    A_pwi = (N*(math.pi)*Dit*0.5*Li)
    return A_pwi

def M_pi(N,Dit,Li,pp):
    M_pi = (N*math.pi*(Dit**2)*0.125*Li*pp)
    return M_pi

def dTpi(Wpi, cpp, Tpi_1, Tpi, hpw, A_pwi, Twi, M_pi):
    dTpi = (Wpi*cpp*(Tpi_1 - Tpi) - hpw*A_pwi*(Tpi -Twi))/(M_pi*cpp)
    return dTpi

# Tube Wall Equations
def A_wsi(N,Dot,Li):
    A_wsi = N*math.pi*Dot*0.5*Li
    return A_wsi

def M_wi(N, Dot,Dit,Li,pw):
    M_wi = (N*math.pi*((Dot**2)-(Dit**2))*0.125*Li*pw)
    return M_wi

def dTwi(hpw,A_pwi, Tpi, Twi, hws, A_wsi, Tsi, M_wi, cpwi):
    dTwi = (hpw*A_pwi*(Tpi -Twi) - hws*A_wsi*(Twi -Tsi))/(M_wi*cpwi)
    return dTwi

# Superheated 
def dTsi(hws, A_wsi,Twi, Tsi, Ws, cps, Tsi_1,As, Ls, ps):
    dTsi = (hws*A_wsi*(Twi - Tsi) - (Ws*cps*(Tsi_1 - Tsi)))/(As*0.5*Ls*ps*cps)
    return dTsi

# Fluid Levels 
def dLsc(f, Power):
    dLsc = f*Power
    return dLsc

def dLb(f, Power):
    dLb = f*Power
    return dLb

def dLs(f, Power):
    dLs = f*Power
    return dLs

# Pressures

def dPSC(Wfw, Wdb, psc, As, dLsc, Ls, Ksc):
    dPsc = (Wfw - Wdb - psc*As*dLsc)/(As*Ls*Ksc)
    return dPsc

def dSAT(hwsc, Awsc, Twi, Tsat, cpsc, Wsc, Tsci, Wdb, As, psc, dLsc, K1, Lsc):
    dPsat = (hwsc*Awsc*(Twi - Tsat) + 2*cpsc*(Wsc*Tsci - Wdb*Tsat) - As*psc*cpsc*(Tsat*dLsc))/(As*psc*cpsc*K1*Lsc)
    return dPsat

def AS(Dos, Dot, Dis, N):
    As = (math.pa*(Dos**2)/4) - (N*math.pi*(Dot**2)/4) - (math.pi*(Dis**2)/4)
    return As

def dPS(Zss, Wb, Ws, R, Tsi_1, Tsi, Mstm, As, Ls):
    dPs = (Zss*(Wb- Ws)*R*((Tsi_1+458.67+Tsi+458.67)/(2*Mstm)))/(As*Ls)
    return dPs

# Mass flow rates

def WSC(Wfw, dLsc, As, psc):
    Wsc = Wfw + 0.5*dLsc*As*psc
    return Wsc

def WDB(Wsc, dLsc, As, psc):
    Wdb = Wsc + 0.5*dLsc*As*psc
    return Wdb

def WB(Wdb, dLsc, As, pb):
    Wb = Wdb + dLsc*As*pb
    return Wb

def W_12(Wb, dLs, As, ps):
    W12 = Wb + 0.5*dLs*As*ps
    return W12

def WS(W12, dLs, As, ps):
    Ws = W12 + 0.5*dLs*As*ps
    return Ws

# Subcooled Temperatures
def dTsc(hwsc,Dot,Lsc,Twi,Tsci,cpsc, Wfw, Tfw, Wsc,dLsc,As, dPsc, psc):
    dTsc = (hwsc*(math.pi)*Dot*0.5*Lsc*(Twi-Tsci) + cpsc*(Wfw*Tfw - Wsc*Tsci) + (1/778)*0.5*As*Lsc*dPsc - 0.5*Tsci*dLsc*As*psc*cpsc)/((0.5*Lsc*As*psc*cpsc))
    return dTsc

def step(magnitude, time, delay, initial):
    
    if time > delay:
        x = magnitude
    else:
        x = initial
        
    return x

# Pressure Control
def DWS(Wso, Cst, kc, Ps, Pset, Ws, ts):
    dWs = (Wso*(1 - Cst*(kc*(1-(Ps/Pset))+((kc*(1-Ps/Pset))/ts)))-Ws)/ts
    return dWs
'''

# Reactor Coeffiecents 
beta1 = 2.432e-4
beta2 = 1.3632e-3
beta3 = 1.2032e-03
beta4 = 2.6048e-03
beta5 = 8.192e-4
beta6 = 1.664e-4

lam1 = 0.0127
lam2 = 0.0317
lam3 = 0.115
lam4 = 0.311
lam5 = 1.40
lam6 = 3.87

alpha = 0.01
tau = 1
K = 1
Kp = 0.3
Ki = 0.01
Tc = -1

# Coeffiecents of the OTSG 
Kb = -0.000053
K1 = 8.02299324e-04
Ksc = -0.000053

# Steam Generator Design Parameters
As = 13.18
Awsc = 2247.22

# heat capacities
cpfw = 1.122
cpp = 1.37661
cpsc = 1.128
cpw = 0.109
cps = 0.762

# Diameters
Dit = 4.642e-02
Dot = 5.208e-02
Dis = 3.5
Dos = 6.84

# heat transfer
hfg = 664.9
hpw = 1.807
hwb = 2.16647
hws = 0.6672
hwsc = 1.18

# densities
pb = 45.14
pf = 45.138
pfw = 53.47
pp = 44.75
ps = 1.15358
psc = 50.76
pw = 526

# Lengths
L = 28
Lb = 19.9302
Ls = 3.85776
Lsc = 4.21202

Mstm = 18
N = 6446
R = 10.71316

# Flow Rates
Wp = 8333.33
Ws = 504.059
Wfw = 504.059

Zss = 0.8313

# Secondary Side
Tsat = 599.079
Tfw = 250

cpw = 2.4
hws = 12
hwb = 12
hwsc = 12

ts = 1
Wso = 504.058
Pset = 825
Ps = 825
Cst = 10
kc = 5

'''
M_p1 = M_pi(N, Dit,Ls,pp)
M_w1 = M_wi(N, Dot,Dit,Ls,pw)
A_pw1 = A_pwi(N,Dit,Ls)
A_ws1 = A_wsi(N,Dot,Ls)
'''



xCurrent = []

msv = 0


def xprime(env, interval):
    while True:
        global xCurrent
       
        c = open("Control.csv", "r")
        msv = float(c.read())
        c.close()
                
        #assigning their states to a columns in the matrix 
        t = env.now
        
        n = xCurrent[0]
        C1 = xCurrent[1]
        C2 = xCurrent[2]
        C3 = xCurrent[3]
        C4 = xCurrent[4]
        C5 = xCurrent[5]
        C6 = xCurrent[6]
        k = xCurrent[7]
        T = xCurrent[8]
        Tp1 = xCurrent[9]
        Tp2 = xCurrent[10]
        Tp3 = xCurrent[11]
        Tp4 = xCurrent[12]
        Tp5 = xCurrent[13]
        Tp6 = xCurrent[14]
        Tw1 = xCurrent[15]
        Tw2 = xCurrent[16]
        Tw3 = xCurrent[17]
        Tw4 = xCurrent[18]
        Tw5 = xCurrent[19]
        Tw6 = xCurrent[20]
        Ts1 = xCurrent[21]
        Ts2 = xCurrent[22]
        Tsc = xCurrent[23]
        Ws = xCurrent[24]
        


        A_pw1 = (N*(math.pi)*Dit*0.5*Ls)
        M_p1 = (N*math.pi*(Dit**2)*0.125*Ls*pp)
        A_ws1 = N*math.pi*Dot*0.5*Ls
        M_w1 = (N*math.pi*((Dot**2)-(Dit**2))*0.125*Ls*pw)

        Tref = 0
        error = Tref - T
       
        
    
        #Reactivity dependent on Temperature
        rho = -alpha*T + Kp*(error) + Ki*k
        
        #Differential Equations
        dndt = (rho - beta1)*n + C1*lam1 + C2*lam1 + C3*lam1 + C4*lam1 + C5*lam1 + C6*lam1 
        dc1dt = beta1*n - lam1*C1
        dc2dt = beta2*n - lam1*C2
        dc3dt = beta3*n - lam1*C3
        dc4dt = beta4*n - lam1*C4
        dc5dt = beta5*n - lam1*C5
        dc6dt = beta6*n - lam1*C6
        dkdt = Tref - T
        dTdt = -T/tau + K*n + Tc
        

        # Primary Side
        dTp1 = (Wp*cpp*(T - Tp1) - hpw*A_pw1*(Tp1 - Tw1))/(M_p1*cpp)
        dTp2 = (Wp*cpp*(Tp1 - Tp2) - hpw*A_pw1*(Tp2 - Tw2))/(M_p1*cpp)
        dTp3 = (Wp*cpp*(Tp2 - Tp3) - hpw*A_pw1*(Tp3 -Tw3))/(M_p1*cpp)
        dTp4 = (Wp*cpp*(Tp3 - Tp4) - hpw*A_pw1*(Tp4 -Tw4))/(M_p1*cpp)
        dTp5 = (Wp*cpp*(Tp4 - Tp5) - hpw*A_pw1*(Tp5 -Tw5))/(M_p1*cpp)
        dTp6 = (Wp*cpp*(Tp5 - Tp6) - hpw*A_pw1*(Tp6 -Tw6))/(M_p1*cpp)
        
        dTw1 = (hpw*A_pw1*(Tp1 - Tw1) - hws*A_ws1*(Tw1 - Ts1))/(M_w1*cpw)
        dTw2 = (hpw*A_pw1*(Tp2 - Tw2) - hws*A_ws1*(Tw2 - Ts2))/(M_w1*cpw)
        dTw3 = (hpw*A_pw1*(Tp3 -Tw3) - hws*A_ws1*(Tw3 -Tsat))/(M_w1*cpw)
        dTw4 = (hpw*A_pw1*(Tp4 -Tw4) - hws*A_ws1*(Tw4 -Tsat))/(M_w1*cpw)
        dTw5 = (hpw*A_pw1*(Tp5 -Tw5) - hws*A_ws1*(Tw5 -Tsc))/(M_w1*cpw)
        dTw6 = (hpw*A_pw1*(Tp6 -Tw6) - hws*A_ws1*(Tw6 -Tsc))/(M_w1*cpw)

        
        dLsc = 2
        dLs = 2

        # Mass Flow Rates
        Wsc = Wfw + 0.5*dLsc*As*psc
        Wdb = Wsc + 0.5*dLsc*As*psc
        Wb = Wdb + dLsc*As*pb
        W12 = Wb + 0.5*dLs*As*ps
        #Ws = W12 + 0.5*dLs*As*ps

        dPS = (Zss*(Wb - Ws)*R*((Ts1+458.67+Ts2+458.67)/(2*Mstm)))/(As*Ls)
        dWs = (Wso*(1 - Cst*(kc*(1-(Ps/Pset))+((kc*(1-Ps/Pset))/ts)))-Ws)/ts
        dPsc = (Wfw - Wdb - psc*As*dLsc)/(As*Ls*Ksc)

        # Secondary Side
        dTsc = (hwsc*(math.pi)*Dot*0.5*Lsc*(Tw1-Tfw) + cpsc*(Wfw*Tfw - Wsc*Tsc) + (1/778)*0.5*As*Lsc*dPsc - 0.5*Tfw*dLsc*As*psc*cpsc)/((0.5*Lsc*As*psc*cpsc))
        dTs1 = (hws*A_ws1*(Tw1 - Ts1) - (Ws*cps*(Ts2 - Ts1)))/(As*0.5*Ls*ps*cps)
        dTs2 = (hws*A_ws1*(Tw2 - Ts2) - (Ws*cps*(Tsat - Ts2)))/(As*0.5*Ls*ps*cps)
        
            

        # Differential Matrix
        xPrime = [dndt, dc1dt, dc2dt, dc3dt, dc4dt, dc5dt, dc6dt, dkdt, dTdt, dTp1, dTp2, dTp3, dTp4, dTp5, dTp6, dTw1, dTw2, dTw3, dTw4, dTw5, dTw6, dTs1, dTs2, dTsc,dWs]
        
        
        
        xMid = [    xCurrent[0] + interval * xPrime[0],
                    xCurrent[1] + interval * xPrime[1],
                    xCurrent[2] + interval * xPrime[2],
                    xCurrent[3] + interval * xPrime[3],
                    xCurrent[4] + interval * xPrime[4],
                    xCurrent[5] + interval * xPrime[5],
                    xCurrent[6] + interval * xPrime[6],
                    xCurrent[7] + interval * xPrime[7],
                    xCurrent[8] + interval * xPrime[8],
                    xCurrent[9] + interval * xPrime[9],
                    xCurrent[10] + interval * xPrime[10],
                    xCurrent[11] + interval * xPrime[11],
                    xCurrent[12] + interval * xPrime[12],
                    xCurrent[11] + interval * xPrime[11],
                    xCurrent[12] + interval * xPrime[12],
                    xCurrent[13] + interval * xPrime[13],
                    xCurrent[14] + interval * xPrime[14],
                    xCurrent[15] + interval * xPrime[15],
                    xCurrent[16] + interval * xPrime[16],
                    xCurrent[17] + interval * xPrime[17],
                    xCurrent[18] + interval * xPrime[18],
                    xCurrent[19] + interval * xPrime[19],
                    xCurrent[20] + interval * xPrime[20],
                    xCurrent[21] + interval * xPrime[21],
                    xCurrent[22] + interval * xPrime[22],
                    xCurrent[23] + interval * xPrime[23],
                    xCurrent[24] + interval * xPrime[24]
                                                                                         
                ]
        
       
        xCurrent = xMid
                      
               
        f = open("sample.csv", "a")
        f.write(str(xCurrent).replace("[", "").replace("]", ""))
        f.write("\n")
        f.close()
        yield env.timeout(interval) 
        

if __name__ == '__main__':

    xCurrent = [1, beta1/lam1, beta2/lam1, beta3/lam1, beta4/lam1, beta5/lam1,beta6/lam1,0,200,400,400,400,0,0,0,0,0,0,0,0,0,0,0,0,0]
    env = simpy.rt.RealtimeEnvironment()
    proc = env.process(xprime(env,0.01))
    
    env.run(until=proc)
    #%%